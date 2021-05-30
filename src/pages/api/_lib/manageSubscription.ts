import { query as fql } from 'faunadb';

import { fauna } from 'services/fauna';
import { stripe } from 'services/stripe';

export async function saveSubscription(
  subscriptionId: string,
  customerId: string,
  createAction = false
) {
  const userRef = await fauna.query(
    fql.Select(
      'ref',
      fql.Get(fql.Match(fql.Index('user_by_stripe_customer_id'), customerId))
    )
  );

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  const subscriptionData = {
    id: subscription.id,
    userId: userRef,
    status: subscription.status,
    priceId: subscription.items.data[0].price.id,
  };

  if (createAction) {
    await fauna.query(
      fql.Create(fql.Collection('subscriptions'), { data: subscriptionData })
    );
  } else {
    await fauna.query(
      fql.Replace(
        fql.Select(
          'ref',
          fql.Get(fql.Match(fql.Index('subscription_by_id'), subscriptionId))
        ),
        {
          data: subscriptionData,
        }
      )
    );
  }
}
