// Payment method selection no longer creates records on this page.
//
// Purchases are created by `payment/whatsapp/actions.ts`
// (`continueOnWhatsapp`) right before the customer is redirected to the
// WhatsApp app, and appointments are created by `appointment/actions.ts`
// (`bookAppointment`) when the customer confirms the selected slot.
