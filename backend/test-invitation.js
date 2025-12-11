// Quick test script to verify invitation sending
const testInvitation = async () => {
    try {
        // First, get a project ID from your database
        // Replace this with an actual project ID from your MongoDB
        const testData = {
            email: "test@example.com",
            role: "editor",
            inviterName: "Test User",
            projectName: "Test Project",
            projectId: "YOUR_PROJECT_ID_HERE" // Replace with actual project ID
        };

        const response = await fetch('http://localhost:3000/api/invitations/send-invitation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testData)
        });

        const data = await response.json();
        console.log('Response:', data);

        if (data.success) {
            console.log('✅ Invitation sent successfully!');
        } else {
            console.log('❌ Failed:', data.message);
        }
    } catch (error) {
        console.error('Error:', error);
    }
};

// Run the test
testInvitation();
