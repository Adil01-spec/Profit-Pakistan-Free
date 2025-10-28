
'use server';

const getApiUrl = () => {
    const mode = process.env.NEXT_PUBLIC_SAFEPAY_MODE;
    return mode === 'sandbox'
        ? 'https://sandbox.api.getsafepay.com'
        : 'https://api.getsafepay.com';
};

export async function createSafepaySession(amount: number) {
    const apiKey = process.env.SAFEPAY_API_KEY;
    const successUrl = process.env.NEXT_PUBLIC_SUCCESS_URL;
    const cancelUrl = process.env.NEXT_PUBLIC_CANCEL_URL;
    
    if (!apiKey || !successUrl || !cancelUrl) {
        console.error('Safepay environment variables are not configured correctly.');
        return { error: 'Payment system is not configured. Please contact support.' };
    }

    const apiUrl = getApiUrl();
    
    try {
        const response = await fetch(`${apiUrl}/checkout/v1/session`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                amount: amount, 
                currency: 'PKR',
                success_url: successUrl,
                cancel_url: cancelUrl,
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            console.error('Safepay API Error:', data);
            throw new Error(data.error?.message || 'Failed to create payment session.');
        }
        
        if (!data.data?.url) {
             throw new Error('No redirect URL received from Safepay.');
        }

        return { redirectUrl: data.data.url };

    } catch (error: any) {
        console.error('Error creating Safepay session:', error);
        return { error: error.message || 'An unexpected error occurred.' };
    }
}


export async function verifySafepayPayment(order_id: string): Promise<{ success: boolean; email?: string; error?: string }> {
    const secretKey = process.env.SAFEPAY_SECRET;
    if (!secretKey) {
        return { success: false, error: 'Safepay secret key is not configured on the server.' };
    }

    const apiUrl = getApiUrl();
    
    try {
        const response = await fetch(`${apiUrl}/order/v1/payments?order_id=${order_id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${secretKey}`
            }
        });
        
        const result = await response.json();
        
        if (!response.ok || result.status.error) {
            console.error('Safepay Verification Error:', result);
            throw new Error(result.status.message || 'Payment verification request failed.');
        }
        
        const payment = result.data.payments.find((p: any) => p.status === 'PAID');
        
        if (payment) {
            return { success: true, email: payment.customer.email };
        } else {
            return { success: false, error: 'Payment not completed.' };
        }
    } catch (error: any) {
        console.error('Error verifying Safepay payment:', error);
        return { success: false, error: error.message || 'An unexpected verification error occurred.' };
    }
}
