const extractButton = document.getElementById('extractButton');
const fileInput = document.getElementById('fileInput');
const outputDiv = document.getElementById('output');

extractButton.addEventListener('click', async () => {
    const file = fileInput.files[0];
    if (!file) {
        alert('Please upload a Word document.');
        return;
    }

    const text = await readFile(file);
    const normativeSentences = await extractNormativeSentences(text);
    outputDiv.innerHTML = normativeSentences.join('<br>');
});

function readFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const arrayBuffer = event.target.result;
            mammoth.convertToText({ arrayBuffer: arrayBuffer })
                .then(result => resolve(result.value))
                .catch(err => reject(err));
        };
        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
    });
}

async function extractNormativeSentences(text) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer YOUR_API_KEY',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'gpt-4',
            messages: [
                { role: 'user', content: `Extract normative sentences from the following text:\n${text}` }
            ],
            max_tokens: 1000
        })
    });

    const data = await response.json();
    return data.choices[0].message.content.split('\n'); // Assuming each sentence is on a new line
}
