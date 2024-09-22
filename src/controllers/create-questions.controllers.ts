import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "src/auth/current-user-decorator";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { UserPayload } from "src/auth/jwt.strategy";
import { ZodValidationPipe } from "src/pipes/zod-validation-pipe";
import { PrismaService } from "src/prisma/prisma.service";
import { z } from "zod";

const createQuestionsBodySchema = z.object({
  title: z.string(),
  content: z.string(),
});

type CreateQuestionsBodySchema = z.infer<typeof createQuestionsBodySchema>;

@Controller("/questions")
@UseGuards(JwtAuthGuard)
export class CreateQuestionsController {
  constructor(private prisma: PrismaService) {}

  @Post()
  async handle(
    @Body(new ZodValidationPipe(createQuestionsBodySchema))
    body: CreateQuestionsBodySchema,
    @CurrentUser() user: UserPayload
  ) {
    const { title, content } = body;
    const userId = user.sub;

    const slug = this.stringToSlug(title);

    await this.prisma.question.create({
      data: {
        title,
        content,
        slug,
        authorId: userId,
      },
    });
  }
  private stringToSlug(title: string): string {
    // Remove accents and convert to lowercase
    const normalizedStr = title
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

    // Replace spaces and other unwanted characters with hyphens
    const slug = normalizedStr.replace(/\s+/g, "-").replace(/[^\w-]+/g, "");

    // Remove any trailing or leading hyphens
    return slug.replace(/^-+|-+$/g, "");
  }
}
