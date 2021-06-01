import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/client';
import { query as fql } from 'faunadb';

import { stripe } from 'services/stripe';
import { fauna } from 'services/fauna';

type User = {
  ref: {
    id: string;
  };
  data: {
    stripe_customer_id: string;
  };
};

export default async (request: NextApiRequest, response: NextApiResponse) => {
  if (!(request.method === 'POST')) {
    response.setHeader('Allow', 'POST');
    response.status(405).end('Method not allowed');

    return response;
  }

  const session = await getSession({ req: request });

  const user = await fauna.query<User>(
    fql.Get(
      fql.Match(fql.Index('user_by_email'), fql.Casefold(session.user.email)),
    ),
  );

  let customerId = user.data.stripe_customer_id;

  if (!customerId) {
    const stripeCustomer = await stripe.customers.create({
      email: session.user.email,
    });

    await fauna.query(
      fql.Update(fql.Ref(fql.Collection('users'), user.ref.id), {
        data: {
          stripe_customer_id: stripeCustomer.id,
        },
      }),
    );

    customerId = stripeCustomer.id;
  }

  const stripeCheckoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    billing_address_collection: 'required',
    line_items: [{ price: 'price_1IZfQnJBDweHRUz5eFr9cv05', quantity: 1 }],
    mode: 'subscription',
    allow_promotion_codes: true,
    success_url: process.env.STRIPE_SUCCESS_URL,
    cancel_url: process.env.STRIPE_CANCEL_URL,
  });

  return response.json({ sessionId: stripeCheckoutSession.id });
};
