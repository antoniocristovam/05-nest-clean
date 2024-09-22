import { INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import { hash } from "bcryptjs";
import { AppModule } from "src/app.module";
import { PrismaService } from "src/prisma/prisma.service";
import request from "supertest";

describe("Fetch recent questions (E2E)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwt: JwtService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    prisma = moduleRef.get<PrismaService>(PrismaService);
    jwt = moduleRef.get<JwtService>(JwtService);

    await app.init();
  });

  test("[GET] /questions", async () => {
    const user = await prisma.user.create({
      data: {
        name: "Antonio Cristovam",
        email: "antoniocristovam@outlook.com.br",
        password: await hash("12345678", 8),
      },
    });

    const accessToken = jwt.sign({ sub: user.id });

    await prisma.question.createMany({
      data: [
        {
          authorId: user.id,
          content: "I want to",
          title: "Teste 01",
          slug: "new-question",
        },
        {
          authorId: user.id,
          content: "I want to",
          title: "Teste 02",
          slug: "new-question",
        },
        {
          authorId: user.id,
          content: "I want to2",
          title: "Teste 03",
          slug: "new-question",
        },
      ],
    });

    const response = await request(app.getHttpServer())
      .get("/questions")
      .set("Authorization", `Bearer ${accessToken}`)
      .send();

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      questions: [
        expect.objectContaining({ title: "Teste 01" }),
        expect.objectContaining({ title: "Teste 02" }),
      ],
    });
  });
});
