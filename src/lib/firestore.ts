import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import app from '@/firebase/config';

interface PaymentRequestData {
    name: string;
    email: string;
    phone: string;
    paymentMethod: string;
    transactionId?: string;
}

export async function submitPaymentRequest(data: PaymentRequestData): Promise<{ success: boolean, error?: string }> {
    try {
        const firestore = getFirestore(app);
        const proRequestsCollection = collection(firestore, 'proRequests');

        await addDoc(proRequestsCollection, {
            name: data.name,
            email: data.email,
            phone: data.phone,
            paymentMethod: data.paymentMethod,
            transactionId: data.transactionId || null,
            // screenshotUrl will be handled separately if needed, e.g., via Cloud Storage
            paymentId: 'SP' + Date.now(),
            status: 'pending',
            requestedAt: serverTimestamp(),
        });

        return { success: true };
    } catch (error: any) {
        console.error("Error writing to Firestore: ", error);
        // Check for specific Firestore errors
        if (error.code === 'permission-denied') {
            return { success: false, error: "Permission denied. Please check your security rules." };
        }
        return { success: false, error: error.message || "Could not submit payment request." };
    }
}
