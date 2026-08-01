import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "luandantas760@gmail.com";
  const password = "Ldm2806!";

  // Gera o hash seguro da nova senha com Bcrypt
  const hashedPassword = await bcrypt.hash(password, 10);

  // Atualiza a senha se o e-mail já existir, ou cria se não existir
  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
    },
    create: {
      name: "Luan Dantas",
      email,
      password: hashedPassword,
    },
  });

  console.log(`✅ Usuário administrador configurado com sucesso: ${admin.email}`);
}

main()
  .catch((e) => {
    console.error("❌ Erro ao rodar o seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });