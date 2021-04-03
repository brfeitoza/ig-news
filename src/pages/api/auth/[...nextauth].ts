import NextAuth from "next-auth";
import Providers from "next-auth/providers";
import { query as fql } from "faunadb";

import { fauna } from "services/fauna";

export default NextAuth({
  providers: [
    Providers.GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      scope: "read:user",
    }),
  ],
  jwt: {
    signingKey: process.env.SIGNING_KEY,
  },
  callbacks: {
    async session(session) {
      try {
        const userActiveSubscription = await fauna.query(
          fql.Get(
            fql.Intersection([
              fql.Match(
                fql.Index("subscription_by_user_ref"),
                fql.Select(
                  "ref",
                  fql.Get(
                    fql.Match(
                      fql.Index("user_by_email"),
                      fql.Casefold(session.user.email)
                    )
                  )
                )
              ),
              fql.Match(fql.Index("subscription_by_status"), "active"),
            ])
          )
        );

        return { ...session, activeSubscription: userActiveSubscription };
      } catch {
        return { ...session, activeSubscription: null };
      }
    },
    async signIn(user, account, profile) {
      const { email } = user;

      try {
        await fauna.query(
          fql.If(
            fql.Not(
              fql.Exists(
                fql.Match(fql.Index("user_by_email"), fql.Casefold(user.email))
              )
            ),
            fql.Create(fql.Collection("users"), { data: { email } }),
            fql.Get(
              fql.Match(fql.Index("user_by_email"), fql.Casefold(user.email))
            )
          )
        );

        return true;
      } catch {
        return false;
      }
    },
  },
});
