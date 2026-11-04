
// find my test consultation form
const testForm = document.getElementById("testForm");

// run this when the test form is submitted
testForm.addEventListener("submit", async function(event) {

    // stop the page from refreshing
    event.preventDefault();

    // get the test concern
    const concern = document.getElementById("testConcern").value;

    // find where the result will appear
    const resultText = document.getElementById("testResult");

    try {

        // send the test concern to my backend
        const response = await fetch("/api/consultation", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                concern: concern
            })
        });

        // read the backend response
        const result = await response.json();

        // show the result on my website
        resultText.textContent = result.message || result.error;

    } catch (error) {

        // show a message if the backend is unavailable
        resultText.textContent = "could not connect to backend";
    }
});
