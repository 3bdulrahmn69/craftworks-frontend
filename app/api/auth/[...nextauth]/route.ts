import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import axios from 'axios';
import '@/app/types/types';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          // Make a request to your Node.js backend to authenticate
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/login`,
            {
              email: credentials?.email,
              password: credentials?.password,
            }
          );

          const { token, user } = response.data;

          if (user && token) {
            // Return user object with token to be stored in JWT
            return {
              id: user.id,
              email: user.email,
              name: user.full_name,
              role: user.role,
              profile_image: user.profile_image,
              token: token,
            };
          } else {
            return null; // Return null if authentication fails
          }
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Add user data to token after successful sign-in
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.profile_image = user.profile_image;
        token.accessToken = user.token;
      }
      return token;
    },
    async session({ session, token }) {
      // Add user data to session
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.profile_image = token.profile_image as string;
        session.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
