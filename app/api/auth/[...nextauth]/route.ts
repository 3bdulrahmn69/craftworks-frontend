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
        phone: { label: 'Phone', type: 'text' },
        password: { label: 'Password', type: 'password' },
        loginType: { label: 'Login Type', type: 'text' },
        // Add support for pre-authenticated data (for register flow)
        token: { label: 'Token', type: 'text' },
        userData: { label: 'User Data', type: 'text' },
      },
      async authorize(credentials) {
        try {
          // If token and userData are provided (register flow), use them directly
          if (credentials?.token && credentials?.userData) {
            const user = JSON.parse(credentials.userData);
            return {
              id: user.id,
              email: user.email,
              name: user.fullName,
              role: user.role,
              profilePicture: user.profilePicture,
              token: credentials.token,
            };
          }

          // Otherwise, make a login request to the backend
          const response = await axios.post(
            `${
              process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
            }/auth/login`,
            {
              email: credentials?.email,
              phone: credentials?.phone,
              password: credentials?.password,
              loginType: credentials?.loginType || 'email',
              type: 'public',
            }
          );

          const responseData = response.data;

          if (
            responseData.success &&
            responseData.data.token &&
            responseData.data.user
          ) {
            const { token, user } = responseData.data;
            return {
              id: user.id,
              email: user.email,
              name: user.fullName,
              role: user.role,
              profilePicture: user.profilePicture,
              token: token,
            };
          } else {
            return null;
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
        token.profilePicture = user.profilePicture;
        token.accessToken = user.token;
      }
      return token;
    },
    async session({ session, token }) {
      // Add user data to session
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.profilePicture = token.profilePicture as string;
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
