import re

class ExperienceDetector:

    def detect_years(self, text: str):
        matches = re.findall(r'(\d+)\+?\s+years?', text.lower())

        if not matches:
            return 0

        years = [int(x) for x in matches]

        return max(years)
    
