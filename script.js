function goToSurvey() {
    window.location.href = "survey.html";
}

function submitSurvey() {
    document.getElementById("message").innerText =
    "Survey submitted successfully! Preparing your confidence analysis...";
    
    setTimeout(() => {
        window.location.href = "analysis.html";
    }, 1500);
}