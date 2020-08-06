import axios from 'axios';
import { showAlert } from './alerts'
// this is the stripe object that we got access to by including the stripe script
const stripe = Stripe('pk_test_51HCWahDqocneOHatFXNt6dtPfsGZK7OgInWlaV6yPZaoIgISVV9yxssn6NwcAoaMzkhVE0UDOiM2kz1TNgQjltAq00GU2XrMhd'); 

export const bookTour = async tourId => {
    try {
        // 1) get checkout session from the api
        const session = await axios(`http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`)
    
        // 2) create checkout form + charge credit card
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id
        })

    } catch (err) {
        console.error(err);
        showAlert('error', err)
    }
    
}