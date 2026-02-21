import os
import json
import re
from flask import Flask, request, jsonify
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

TASK_XP = {
    "solve_leetcode": 50,
    "attend_hackathon": 150,
    "apply_internship": 100,
    "give_presentation": 120,
    "build_project": 200
}


@app.route("/analyze-confidence", methods=["POST"])
def analyze_confidence():

    user_answers = request.get_json()

    if not user_answers:
        return jsonify({"error": "No user answers provided"}), 400

    prompt = f"""
    You are an AI mentor helping women gain confidence in tech.

    Based on the answers provided:
    1. Analyze confidence level (Low / Medium / High)
    2. Provide 3-5 personalized improvement suggestions
    3. Recommend tasks ONLY from this list:
       - solve_leetcode
       - attend_hackathon
       - apply_internship
       - give_presentation
       - build_project

    Return STRICT JSON in this format:

    {{
        "confidence_level": "",
        "improvement_suggestions": [],
        "recommended_tasks": []
    }}

    User Answers:
    {user_answers}
    """

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3
        )

        raw_output = response.choices[0].message.content.strip()

        # 🔥 Clean possible markdown formatting
        cleaned_output = re.sub(r"```json|```", "", raw_output).strip()

        parsed_output = json.loads(cleaned_output)

        # Final structured response
        final_response = {
            "selected_answers": user_answers,
            "confidence_level": parsed_output.get("confidence_level"),
            "improvement_suggestions": parsed_output.get("improvement_suggestions", []),
            "recommended_tasks": parsed_output.get("recommended_tasks", [])
        }

        return jsonify(final_response)

    except Exception as e:
        return jsonify({
            "error": "Failed to analyze confidence",
            "details": str(e)
        }), 500


if __name__ == "__main__":
    app.run(debug=True)