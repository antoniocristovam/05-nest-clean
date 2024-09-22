import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { hash } from "bcryptjs";
import { access } from "fs";
import { AppModule } from "src/app.module";
import { PrismaService } from "src/prisma/prisma.service";
import request from "supertest";

describe("Authenticate (E2E)", () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    prisma = moduleRef.get<PrismaService>(PrismaService);

    await app.init();
  });

  test("[POST] /sessions", async () => {
    await prisma.user.create({
      data: {
        name: "Antonio Cristovam",
        email: "antoniocristovam@outlook.com.br",
        password: await hash("12345678", 8),
      },
    });

    const response = await request(app.getHttpServer()).post("/sessions").send({
      name: "Antonio Cristovam",
      email: "antoniocristovam@outlook.com.br",
      password: "12345678",
    });

    expect(response.status).toBe(201);

    expect(response.body).toEqual({
      access_token: expect.any(String),
    });
  });
});
