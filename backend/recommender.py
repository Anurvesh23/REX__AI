# recommender.py
def suggest_missing_skills(resume_skills, jd_skills):
	"""Return skills in JD not in resume."""
	return list(set(jd_skills) - set(resume_skills))

def generate_bullet_rewrites(missing_skills):
	"""Stub: Suggest bullet points for missing skills."""
	return {skill: [f"Demonstrated experience with {skill}."] for skill in missing_skills}

def prioritized_learning_plan(missing_skills):
	"""Stub: Return a simple learning plan for missing skills."""
	plan = "\n".join([f"- Study and practice {skill}" for skill in missing_skills])
	return plan
