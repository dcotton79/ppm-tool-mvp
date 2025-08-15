import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";

const handler = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        name: { label: "Name", type: "text" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email || "").trim().toLowerCase();
        const name = String(credentials?.name || "").trim() || "User";
        if (!email) return null;
        let user = await prisma.user.findUnique({ where: { email } });
        if (!user) user = await prisma.user.create({ data: { email, name } });
        const existingRes = await prisma.resource.findFirst({ where: { userId: user.id } });
        if (!existingRes) {
          await prisma.resource.create({ data: { name: user.name || "Member", role: "Member", userId: user.id } });
        }
        return { id: user.id, name: user.name, email: user.email };
      },
    }),
  ],
});

export { handler as GET, handler as POST };
