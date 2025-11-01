import { getFirestore, collection, addDoc, serverTimestamp, type Firestore } from 'firebase/firestore';
import app from '@/firebase/config';

interface PaymentRequestData {
    name: string;
    email: string;
    phone: string;
    paymentMethod: string;
    transactionId?: string;
    paymentId: string;
}

export async function submitPaymentRequest(
    firestore: Firestore,
    data: PaymentRequestData
): Promise<{ success: boolean; error?: string }> {
    try {
        const proRequestsCollection = collection(firestore, 'proRequests');

        await addDoc(proRequestsCollection, {
            name: data.name,
            email: data.email,
            phone: data.phone,
            paymentMethod: data.paymentMethod,
            transactionId: data.transactionId || null,
            paymentId: data.paymentId,
            status: 'pending',
            requestedAt: serverTimestamp(),
        });
        
        console.log("✅ proRequest created");
        return { success: true };

    } catch (error: any) {
        console.error("Firestore write failed:", error);
        if (error.code === 'permission-denied') {
            return { success: false, error: "Permission denied. Please check security rules." };
        }
        return { success: false, error: "Failed to submit. Please check your internet or try again later." };
    }
}
