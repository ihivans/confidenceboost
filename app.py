import os
from groq import Groq

# Initialize Groq client
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# XP Map
TASK_XP = {
    "solve_leetcode": 50,
    "attend_hackathon": 150,
    "apply_internship": 100,
    "give_presentation": 120,
    "build_project": 200
}


def analyze_confidence_and_assign_tasks(user_answers: dict):
    """
    user_answers = {
        "q1": "Yes, but I feel scared sometimes",
        "q2": "No, I avoid presentations",
        ...
    }
    """

    prompt = f"""
    You are an AI confidence mentor for women in tech.

    Analyze the following answers and return:

    1. Confidence Level (Low / Medium / High)
    2. Main Weak Areas
    3. Suggested Tasks (choose from: solve_leetcode, attend_hackathon, apply_internship, give_presentation, build_project)

    User Answers:
    {user_answers}

    Return output strictly in JSON format like:
    {{
        "confidence_level": "",
        "weak_areas": [],
        "suggested_tasks": []
    }}
    """

    response = client.chat.completions.create(
        model="llama3-70b-8192",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3
    )

    result = response.choices[0].message.content

    return result


def calculate_xp(completed_tasks: list):
    """
    completed_tasks = ["solve_leetcode", "give_presentation"]
    """

    total_xp = 0

    for task in completed_tasks:
        total_xp += TASK_XP.get(task, 0)

    return total_xp