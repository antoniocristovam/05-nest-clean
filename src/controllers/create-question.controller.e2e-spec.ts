import { INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import { hash } from "bcryptjs";
import { AppModule } from "src/app.module";
import { PrismaService } from "src/prisma/prisma.service";
import request from "supertest";

describe("Create questions (E2E)", () => {
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

  test("[POST] /questions", async () => {
    const user = await prisma.user.create({
      data: {
        name: "Antonio Cristovam",
        email: "antoniocristovam@outlook.com.br",
        password: await hash("12345678", 8),
      },
    });

    const accessToken = jwt.sign({ sub: user.id });

    const response = await request(app.getHttpServer())
      .post("/questions")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        title: "How to create a new question?",
        content:
          "I want to create a new question, but I do not know how to do it. Can someone help me?",
      });

    expect(response.status).toBe(201);

    const questionOnDataBase = await prisma.question.findFirst({
      where: {
        title: "New question",
      },
    });

    expect(questionOnDataBase).toBeTruthy();
  });
});
