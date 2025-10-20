"""
CBC Curriculum JSON Processor
==============================
This script processes the CBC curriculum JSON to:
1. Add unique IDs to each strand
2. Create a simplified version for modal selection (without descriptions)
3. Maintain the original structure with added IDs

Author: AI Tutors Team
Date: October 20, 2025
"""

import json
import re
from typing import Dict, List, Any
from pathlib import Path

# Explicit paths
INPUT_PATH = r"C:\Users\HP\Documents\ai-tutors-frontend\src\components\CBCStudent\cbc_curriculum.json"
OUTPUT_FULL_PATH = r"C:\Users\HP\Documents\ai-tutors-frontend\src\components\CBCStudent\cbc_curriculum_with_ids.json"
OUTPUT_SIMPLE_PATH = r"C:\Users\HP\Documents\ai-tutors-frontend\src\components\CBCStudent\cbc_curriculum_simple.json"


def slugify(text: str) -> str:
    """Convert text to URL-friendly slug"""
    # Convert to lowercase
    text = text.lower()
    # Remove special characters and replace spaces with hyphens
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text)
    # Remove leading/trailing hyphens
    text = text.strip('-')
    return text


def create_strand_id(subject_name: str, grade_num: int, strand_name: str) -> str:
    """
    Create a unique strand ID
    Format: {subject-abbrev}-g{grade}-{strand-slug}
    """
    # Create subject abbreviation
    subject_slug = slugify(subject_name)
    
    # Shorten common long subject names
    subject_abbrev_map = {
        'english-language-activities': 'english',
        'kiswahili-language-activities': 'kiswahili',
        'mathematical-activities': 'math',
        'mathematics': 'math',
        'environmental-activities': 'enviro',
        'science-and-technology': 'science',
        'science-and-technology-activities': 'science',
        'integrated-science': 'science',
        'hygiene-and-nutrition-activities': 'hygiene',
        'movement-and-creative-activities': 'creative',
        'creative-arts': 'arts',
        'physical-and-health-education': 'pe',
        'physical-education-and-sports': 'pe',
        'religious-education-cre-ire-hre': 'religion',
        'religious-education-activities-cre-example': 'religion',
        'indigenous-language-activities': 'indigenous',
        'pre-technical-and-pre-vocational-studies': 'prevoc',
        'social-studies': 'social',
        'life-skills-education': 'lifeskills',
        'home-science': 'homesci',
        'agriculture': 'agric',
        'business-education': 'business',
        'foreign-languages-optional-pathways': 'foreign',
    }
    
    subject_abbrev = subject_abbrev_map.get(subject_slug, subject_slug[:10])
    
    # Create strand slug
    strand_slug = slugify(strand_name)
    
    # Combine into ID
    strand_id = f"{subject_abbrev}-g{grade_num}-{strand_slug}"
    
    return strand_id


def extract_grade_number(programme: str) -> int:
    """Extract grade number from programme string"""
    match = re.search(r'Grade\s+(\d+)', programme, re.IGNORECASE)
    if match:
        return int(match.group(1))
    return 0


def validate_grade_data(grade_data: Dict[str, Any], grade_idx: int) -> None:
    """
    Validate that a grade has all required fields
    Raises ValueError if validation fails
    """
    # Check required top-level fields
    if 'programme' not in grade_data:
        raise ValueError(f"❌ Grade {grade_idx}: Missing 'programme' field")
    
    # Handle both 'subjects' and 'core_subjects' (Grade 9+ uses core_subjects)
    has_subjects = 'subjects' in grade_data
    has_core_subjects = 'core_subjects' in grade_data
    
    if not has_subjects and not has_core_subjects:
        raise ValueError(f"❌ Grade {grade_idx}: Missing 'subjects' or 'core_subjects' field")
    
    # Get the appropriate key
    subjects_key = 'subjects' if has_subjects else 'core_subjects'
    
    if not isinstance(grade_data[subjects_key], list):
        raise ValueError(f"❌ Grade {grade_idx}: '{subjects_key}' must be an array")
    
    if len(grade_data[subjects_key]) == 0:
        raise ValueError(f"❌ Grade {grade_idx}: '{subjects_key}' array is empty")


def validate_subject_data(subject: Dict[str, Any], subject_idx: int, grade_name: str) -> None:
    """
    Validate that a subject has all required fields
    Raises ValueError if validation fails
    """
    if 'name' not in subject:
        raise ValueError(f"❌ {grade_name} - Subject {subject_idx}: Missing 'name' field")
    
    if 'strands' not in subject:
        raise ValueError(f"❌ {grade_name} - Subject '{subject.get('name', 'Unknown')}': Missing 'strands' field")
    
    if not isinstance(subject['strands'], list):
        raise ValueError(f"❌ {grade_name} - Subject '{subject.get('name', 'Unknown')}': 'strands' must be an array")
    
    if len(subject['strands']) == 0:
        raise ValueError(f"❌ {grade_name} - Subject '{subject.get('name', 'Unknown')}': 'strands' array is empty")


def validate_strand_data(strand: Dict[str, Any], strand_idx: int, subject_name: str, grade_name: str) -> None:
    """
    Validate that a strand has all required fields
    Raises ValueError if validation fails
    """
    if 'name' not in strand:
        raise ValueError(f"❌ {grade_name} - {subject_name} - Strand {strand_idx}: Missing 'name' field")
    
    if 'subtopics' not in strand:
        raise ValueError(f"❌ {grade_name} - {subject_name} - Strand '{strand.get('name', 'Unknown')}': Missing 'subtopics' field")
    
    if not isinstance(strand['subtopics'], list):
        raise ValueError(f"❌ {grade_name} - {subject_name} - Strand '{strand.get('name', 'Unknown')}': 'subtopics' must be an array")


def process_curriculum(data: List[Dict[str, Any]]) -> tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """
    Process curriculum data to add IDs and create simplified version
    
    Returns:
        tuple: (full_data_with_ids, simplified_data)
    
    Raises:
        ValueError: If validation fails for any grade/subject/strand
    """
    full_data = []
    simple_data = []
    
    total_grades = len(data)
    print(f"\n{'='*60}")
    print(f"Processing {total_grades} grades...")
    print(f"{'='*60}\n")
    
    for grade_idx, grade_data in enumerate(data, 1):
        programme = grade_data.get('programme', 'Unknown')
        grade_num = extract_grade_number(programme)
        
        print(f"{'='*60}")
        print(f"📚 GRADE {grade_idx}/{total_grades}: {programme}")
        print(f"{'='*60}")
        
        # VALIDATE GRADE
        print(f"🔍 Validating grade structure...")
        try:
            validate_grade_data(grade_data, grade_idx)
            print(f"   ✅ Grade structure valid")
        except ValueError as e:
            print(f"\n{e}")
            print(f"   ⛔ VALIDATION FAILED - STOPPING PROCESS")
            raise
        
        # Check optional fields
        print(f"📋 Checking fields:")
        print(f"   • programme: '{programme}'")
        print(f"   • age_range: '{grade_data.get('age_range', 'NOT FOUND')}'")
        print(f"   • notes: {'Present' if grade_data.get('notes') else 'NOT FOUND'}")
        print(f"   • grade_number: {grade_num}")
        
        # Process full data with IDs
        processed_grade = {
            'programme': grade_data['programme'],
            'age_range': grade_data.get('age_range', ''),
            'notes': grade_data.get('notes', ''),
            'subjects': []
        }
        
        # Process simple data (no descriptions)
        simple_grade = {
            'programme': grade_data['programme'],
            'grade_number': grade_num,
            'subjects': []
        }
        
        # Collect all subjects from different keys
        all_subjects = []
        subjects_sources = []
        
        # Regular subjects (Grades 1-8)
        if 'subjects' in grade_data:
            all_subjects.extend(grade_data['subjects'])
            subjects_sources.append(f"{len(grade_data['subjects'])} subjects")
        
        # Core subjects (Grades 9+)
        if 'core_subjects' in grade_data:
            all_subjects.extend(grade_data['core_subjects'])
            subjects_sources.append(f"{len(grade_data['core_subjects'])} core_subjects")
        
        # Pathway subjects (Grades 9+)
        if 'pathway_subjects' in grade_data:
            pathway_data = grade_data['pathway_subjects']
            for pathway_name, pathway_subjects in pathway_data.items():
                all_subjects.extend(pathway_subjects)
                subjects_sources.append(f"{len(pathway_subjects)} from {pathway_name}")
        
        sources_str = " + ".join(subjects_sources) if subjects_sources else "0 subjects"
        print(f"\n📚 Processing {len(all_subjects)} total subjects ({sources_str})...")
        print(f"{'-'*60}")
        
        total_strands_in_grade = 0
        
        for subject_idx, subject in enumerate(all_subjects, 1):
            subject_name = subject.get('name', 'Unknown')
            
            # VALIDATE SUBJECT
            print(f"\n   [{subject_idx}/{len(all_subjects)}] Subject: {subject_name}")
            try:
                validate_subject_data(subject, subject_idx, programme)
                print(f"       ✅ Subject structure valid")
            except ValueError as e:
                print(f"\n{e}")
                print(f"       ⛔ VALIDATION FAILED - STOPPING PROCESS")
                raise
            
            # Full version
            processed_subject = {
                'name': subject_name,
                'strands': []
            }
            
            # Simple version
            simple_subject = {
                'name': subject_name,
                'strands': []
            }
            
            strands = subject.get('strands', [])
            print(f"       🔗 Processing {len(strands)} strands...")
            
            for strand_idx, strand in enumerate(strands, 1):
                strand_name = strand.get('name', 'Unknown')
                
                # VALIDATE STRAND
                try:
                    validate_strand_data(strand, strand_idx, subject_name, programme)
                except ValueError as e:
                    print(f"\n{e}")
                    print(f"          ⛔ VALIDATION FAILED - STOPPING PROCESS")
                    raise
                
                strand_id = create_strand_id(subject_name, grade_num, strand_name)
                total_strands_in_grade += 1
                
                # Check strand fields
                has_description = bool(strand.get('description', '').strip())
                subtopics_count = len(strand.get('subtopics', []))
                
                print(f"          [{strand_idx}/{len(strands)}] {strand_name}")
                print(f"               • ID: {strand_id}")
                print(f"               • Description: {'✅ Present' if has_description else '⚠️  Empty'}")
                print(f"               • Subtopics: {subtopics_count} items")
                
                # Full version with ID
                processed_strand = {
                    'id': strand_id,
                    'name': strand_name,
                    'description': strand.get('description', ''),
                    'subtopics': strand.get('subtopics', [])
                }
                processed_subject['strands'].append(processed_strand)
                
                # Simple version (just ID, name, and subtopics)
                simple_strand = {
                    'id': strand_id,
                    'name': strand_name,
                    'subtopics': strand.get('subtopics', [])
                }
                simple_subject['strands'].append(simple_strand)
            
            if processed_subject['strands']:
                processed_grade['subjects'].append(processed_subject)
                simple_grade['subjects'].append(simple_subject)
            
            print(f"       ✅ {len(strands)} strands processed")
        
        full_data.append(processed_grade)
        simple_data.append(simple_grade)
        
        print(f"{'-'*60}")
        print(f"✅ GRADE {grade_idx} COMPLETE")
        print(f"   • Subjects processed: {len(all_subjects)}")
        print(f"   • Total strands: {total_strands_in_grade}")
        print(f"   • Progress: {grade_idx}/{total_grades} grades")
        print(f"{'='*60}\n")
    
    print(f"\n{'='*60}")
    print(f"✨ ALL GRADES PROCESSED SUCCESSFULLY!")
    print(f"{'='*60}\n")
    
    return full_data, simple_data


def save_json(data: Any, filepath: str, description: str):
    """Save data to JSON file with pretty formatting"""
    print(f"💾 Saving {description}...")
    print(f"   Path: {filepath}")
    
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    file_size = Path(filepath).stat().st_size
    print(f"   ✅ Saved successfully ({file_size:,} bytes)\n")


def main():
    """Main execution function"""
    print("\n" + "="*60)
    print("CBC CURRICULUM JSON PROCESSOR")
    print("="*60)
    
    # Load original data
    print(f"\n📂 Loading original curriculum data...")
    print(f"   Path: {INPUT_PATH}")
    
    try:
        with open(INPUT_PATH, 'r', encoding='utf-8') as f:
            original_data = json.load(f)
        print(f"   ✅ Loaded successfully")
        print(f"   ✅ Found {len(original_data)} grade entries\n")
    except FileNotFoundError:
        print(f"   ❌ Error: File not found at {INPUT_PATH}")
        print(f"   ⛔ PROCESS TERMINATED")
        return
    except json.JSONDecodeError as e:
        print(f"   ❌ Error: Invalid JSON - {e}")
        print(f"   ⛔ PROCESS TERMINATED")
        return
    
    # Process data with validation
    try:
        full_data, simple_data = process_curriculum(original_data)
    except ValueError as e:
        print(f"\n{'='*60}")
        print(f"⛔ PROCESS TERMINATED DUE TO VALIDATION ERROR")
        print(f"{'='*60}")
        print(f"\nPlease fix the error above and run again.\n")
        return
    except Exception as e:
        print(f"\n{'='*60}")
        print(f"⛔ UNEXPECTED ERROR: {e}")
        print(f"{'='*60}\n")
        return
    
    # Calculate statistics
    total_subjects = sum(len(grade['subjects']) for grade in full_data)
    total_strands = sum(
        len(subject['strands']) 
        for grade in full_data 
        for subject in grade['subjects']
    )
    
    print(f"📊 STATISTICS")
    print(f"{'='*60}")
    print(f"   Total Grades: {len(full_data)}")
    print(f"   Total Subjects: {total_subjects}")
    print(f"   Total Strands: {total_strands}")
    print(f"   Average strands per grade: {total_strands / len(full_data):.1f}")
    print(f"{'='*60}\n")
    
    # Save processed files
    save_json(
        full_data, 
        OUTPUT_FULL_PATH, 
        "Full curriculum with IDs"
    )
    
    save_json(
        simple_data, 
        OUTPUT_SIMPLE_PATH, 
        "Simplified curriculum for modal"
    )
    
    # Print sample IDs
    print(f"📋 SAMPLE STRAND IDs (first 10)")
    print(f"{'='*60}")
    count = 0
    for grade in full_data[:3]:  # First 3 grades
        for subject in grade['subjects'][:2]:  # First 2 subjects per grade
            for strand in subject['strands'][:2]:  # First 2 strands per subject
                if count < 10:
                    print(f"   {strand['id']}")
                    print(f"      └─ {strand['name']}")
                    count += 1
                if count >= 10:
                    break
            if count >= 10:
                break
        if count >= 10:
            break
    print(f"{'='*60}\n")
    
    print(f"✅ ALL DONE!")
    print(f"\nOutput files:")
    print(f"   1. Full version: {OUTPUT_FULL_PATH}")
    print(f"   2. Simple version: {OUTPUT_SIMPLE_PATH}")
    print(f"\nUse the simple version for modal dropdowns.")
    print(f"Use the full version for curriculum context in AI prompts.\n")


if __name__ == "__main__":
    main()
