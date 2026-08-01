import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando o seed do banco de dados...");

  // 1. Configura o Usuário Administrador via Upsert (cria ou atualiza)
  const email = "luandantas760@gmail.com";
  const password = "Ldm2806!";
  const hashedPassword = await bcrypt.hash(password, 10);

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

  // 2. Limpa e recria Serviços de teste
  await prisma.service.deleteMany();
  await prisma.service.createMany({
    data: [
      {
        title: "Maquiagem Social",
        tag: "Social · noiva · madrinha",
        duration: "1h 30min",
        price: 180.0,
        desc: "Maquiagens sob medida para cada ocasião, com produtos premium e técnica que valoriza seus traços naturais.",
        image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80",
        items: ["Maquiagem social", "Noiva (com prova)", "Madrinha / formatura", "Ensaios fotográficos"],
        active: true,
      },
      {
        title: "Extensão de Cílios",
        tag: "Extensão · lash lifting",
        duration: "2h 00min",
        price: 150.0,
        desc: "Fios aplicados um a um respeitando o formato dos seus olhos. Efeitos naturais, volume brasileiro ou russo.",
        image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80",
        items: ["Fio a fio clássico", "Volume brasileiro", "Volume russo", "Lash lifting + tintura"],
        active: true,
      },
      {
        title: "Limpeza de Pele Profunda",
        tag: "Profunda · hidratação",
        duration: "1h 30min",
        price: 220.0,
        desc: "Protocolo completo de limpeza, extração e hidratação para uma pele saudável, luminosa e equilibrada.",
        image: "https://images.unsplash.com/photo-1512290900673-7002b5217625?w=800&q=80",
        items: ["Higienização e esfoliação", "Extração de cravos", "Máscara calmante", "Hidratação final"],
        active: true,
      },
    ],
  });
  console.log("💅 Serviços de teste criados.");

  // 3. Limpa e recria Cursos de teste
  await prisma.course.deleteMany();
  await prisma.course.createMany({
    data: [
      {
        title: "Automaquiagem",
        tag: "Iniciante",
        duration: "8 horas · 2 encontros",
        price: 450.0,
        desc: "Aprenda técnicas para se maquiar todos os dias, valorizando seus traços com produtos que você já tem em casa.",
        image: "https://images.unsplash.com/photo-1512290900673-7002b5217625?w=800&q=80",
        items: [
          "Preparação e cuidados com a pele",
          "Base, corretivo e contorno",
          "Sombras, delineado e cílios",
          "Boca — diurna e para eventos",
        ],
        active: true,
      },
      {
        title: "Profissionalizante de Maquiagem",
        tag: "Profissional",
        duration: "60 horas · 8 semanas",
        price: 2400.0,
        desc: "Formação completa para quem quer atuar como maquiadora profissional, com prática em modelos reais.",
        image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80",
        items: [
          "Fundamentos: pele, olhos, boca",
          "Noivas, madrinhas e formaturas",
          "Editorial, passarela e ensaios",
          "Empreendedorismo e marketing pessoal",
          "Certificado de conclusão",
        ],
        active: true,
      },
    ],
  });
  console.log("🎓 Cursos de teste criados.");

  console.log("🚀 Seed concluído com sucesso!");
}

main()
  .catch((e) => {
    console.error("❌ Erro ao rodar o seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });