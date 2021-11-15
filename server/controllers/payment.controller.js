const stripe = require('stripe')(process.env.STRIPE_API);
const { User } = require('../models/user.model.js');
exports.paymentController = (async (req, res) => {

  //user sends price along with request
  const userPrice = parseInt(req.body.total) * 100;

  //create a payment intent

  const intent = await stripe.paymentIntents.create({

    //use the specified price
    amount: userPrice,
    currency: 'usd'

  });
  //respond with the client secret and id of the new payment intent
  res.json({ client_secret: intent.client_secret, intent_id: intent.id });
})

exports.paymentConfirmController = (async (req, res) => {

  //extract payment type from the client request
  const paymentType = String(req.body.payment_type);

  //handle confirmed stripe transaction
  if (paymentType === "stripe") {

    //get payment id for stripe
    const clientId = String(req.body.payment_id);

    //get the transaction based on the provided id
    await stripe.paymentIntents.retrieve(
      clientId,
      function (err, paymentIntent) {

        //handle errors
        if (err) {
          console.log(err);
        }
        //respond to the client that the server confirmed the transaction
        if (paymentIntent.status === 'succeeded') {

          /*YOUR CODE HERE*/
          console.log("confirmed stripe payment: " + clientId);
          res.json({ success: true });
        } else {
          res.json({ success: false });
        }
      }
    );
  }

})

exports.paymentAppleController = async (req, res) => {
  const { paymentDetails, total } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: total,
      currency: 'usd',
      ...paymentDetails,
      confirm: true,
    });
    res.json({ client_secret: paymentIntent.client_secret, intent_id: paymentIntent.id });
  } catch (e) {
    return res.status(400).send({ msg: e.message })
  }
}
exports.confirmPromoCodeController = (async (req, res) => {

  const promoCode = String(req.body.promoCode);
  const id = req.userId;
  try {
    let user = await User.findById(id);
    if (!user) return res.status(400).json({ msg: 'Invalid Credentials1' });
    console.log('user1', user);
    if (user && promoCode === user.promocode) {
      user.trial.active = true;
      /*YOUR CODE HERE*/
      User.findByIdAndUpdate(id, { $set: user }, { new: true }, (err, data) => {
        if (err) {
          console.log(err);
          return res.status(400).send({ msg: err });
        } else {
          console.log("confirmed promo code: " + promoCode);
          return res.json({ user: data, success: true })
        }
      })
        ;
    } else {
      return res.json({ success: false });
    }
  } catch (e) {
    console.log(e);
    return res.status(400);
  }


})
