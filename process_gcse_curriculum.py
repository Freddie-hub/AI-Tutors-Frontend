"""
GCSE/Cambridge Curriculum JSON Processor
=========================================
This script processes the Cambridge/GCSE curriculum JSON to:
1. Add unique IDs to each strand
2. Create a simplified version for modal selection (without descriptions)
3. Maintain the original structure with added IDs

Covers: Years 1-13 (Cambridge Primary, Lower Secondary, IGCSE, AS, A-Level)

Author: AI Tutors Team
Date: October 20, 2025
"""

import json
import re
from typing import Dict, List, Any, Union
from pathlib import Path

# Explicit paths
INPUT_PATH = r"C:\Users\HP\Documents\ai-tutors-frontend\src\components\GCSEStudent\gcse_curriculum.json"
OUTPUT_FULL_PATH = r"C:\Users\HP\Documents\ai-tutors-frontend\src\components\GCSEStudent\gcse_curriculum_with_ids.json"
OUTPUT_SIMPLE_PATH = r"C:\Users\HP\Documents\ai-tutors-frontend\src\components\GCSEStudent\gcse_curriculum_simple.json"


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


def extract_year_number(programme: str) -> int:
    """
    Extract year number from programme string
    Examples:
    - "Cambridge Primary (British-style) - Stage 1 / Year 1" -> 1
    - "Year 10 / Grade 9" -> 10
    - "Year 13 / Grade 12" -> 13
    """
    # Try to find "Year X" pattern
    match = re.search(r'Year\s+(\d+)', programme, re.IGNORECASE)
    if match:
        return int(match.group(1))
    
    # Try to find "Stage X" pattern
    match = re.search(r'Stage\s+(\d+)', programme, re.IGNORECASE)
    if match:
        return int(match.group(1))
    
    return 0


def create_strand_id(subject_name: str, year_num: int, strand_name: str) -> str:
    """
    Create a unique strand ID
    Format: {subject-abbrev}-y{year}-{strand-slug}
    """
    # Create subject slug
    subject_slug = slugify(subject_name)
    
    # Shorten common long subject names
    subject_abbrev_map = {
        'english-first-language': 'english',
        'english-as-a-second-language-if-applicable': 'esl',
        'english-as-a-second-language': 'esl',
        'mathematics': 'math',
        'science': 'science',
        'computing-digital-literacy': 'computing',
        'digital-literacy-computing': 'computing',
        'global-perspectives-humanities-foundations': 'humanities',
        'global-perspectives-humanities': 'humanities',
        'humanities-geography-history': 'humanities',
        'art-design': 'art',
        'music': 'music',
        'physical-education-pe': 'pe',
        'wellbeing-personal-social-emotional-development': 'wellbeing',
        'wellbeing-personal-social-health-education': 'wellbeing',
        'chemistry': 'chemistry',
        'physics': 'physics',
        'biology': 'biology',
        'computer-science': 'compsci',
        'literature-in-english': 'literature',
        'history': 'history',
        'geography': 'geography',
        'business-studies': 'business',
        'economics': 'economics',
        'psychology': 'psychology',
        'sociology': 'sociology',
        'art-and-design': 'art',
        'drama': 'drama',
        'languages-modern-foreign-languages': 'languages',
        'physical-education': 'pe',
    }
    
    subject_abbrev = subject_abbrev_map.get(subject_slug, subject_slug[:10])
    
    # Create strand slug
    strand_slug = slugify(strand_name)
    
    # Combine into ID (using 'y' for year instead of 'g' for grade)
    strand_id = f"{subject_abbrev}-y{year_num}-{strand_slug}"
    
    return strand_id


def validate_year_data(year_data: Dict[str, Any], year_idx: int) -> None:
    """
    Validate that a year has all required fields
    Raises ValueError if validation fails
    """
    # Check if it's a nested curriculum structure
    if 'curriculum' in year_data:
        curriculum = year_data['curriculum']
        if 'programme' not in curriculum:
            raise ValueError(f"❌ Year {year_idx}: Missing 'programme' field in curriculum")
        if 'subjects' not in curriculum:
            raise ValueError(f"❌ Year {year_idx}: Missing 'subjects' field in curriculum")
        if not isinstance(curriculum['subjects'], list):
            raise ValueError(f"❌ Year {year_idx}: 'subjects' must be an array")
        if len(curriculum['subjects']) == 0:
            raise ValueError(f"❌ Year {year_idx}: 'subjects' array is empty")
    else:
        # Direct structure (no curriculum wrapper)
        if 'programme' not in year_data:
            raise ValueError(f"❌ Year {year_idx}: Missing 'programme' field")
        if 'subjects' not in year_data:
            raise ValueError(f"❌ Year {year_idx}: Missing 'subjects' field")
        if not isinstance(year_data['subjects'], list):
            raise ValueError(f"❌ Year {year_idx}: 'subjects' must be an array")
        if len(year_data['subjects']) == 0:
            raise ValueError(f"❌ Year {year_idx}: 'subjects' array is empty")


def validate_subject_data(subject: Dict[str, Any], subject_idx: int, year_name: str) -> None:
    """
    Validate that a subject has all required fields
    Raises ValueError if validation fails
    """
    if 'name' not in subject and 'subject_name' not in subject:
        raise ValueError(f"❌ {year_name} - Subject {subject_idx}: Missing 'name' or 'subject_name' field")
    
    if 'strands' not in subject:
        subject_name = subject.get('name') or subject.get('subject_name', 'Unknown')
        raise ValueError(f"❌ {year_name} - Subject '{subject_name}': Missing 'strands' field")
    
    if not isinstance(subject['strands'], list):
        subject_name = subject.get('name') or subject.get('subject_name', 'Unknown')
        raise ValueError(f"❌ {year_name} - Subject '{subject_name}': 'strands' must be an array")


def validate_strand_data(strand: Dict[str, Any], strand_idx: int, subject_name: str, year_name: str) -> None:
    """
    Validate that a strand has all required fields
    Raises ValueError if validation fails
    """
    strand_name_field = strand.get('name') or strand.get('strand_name')
    
    if not strand_name_field:
        raise ValueError(f"❌ {year_name} - {subject_name} - Strand {strand_idx}: Missing 'name' or 'strand_name' field")
    
    # Subtopics/objectives are optional but worth noting
    has_subtopics = 'subtopics' in strand
    has_objectives = 'objectives' in strand
    
    if not has_subtopics and not has_objectives:
        print(f"          ⚠️  Warning: Strand '{strand_name_field}' has no subtopics or objectives")


def process_curriculum(data: List[Dict[str, Any]]) -> tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """
    Process curriculum data to add IDs and create simplified version
    
    Returns:
        tuple: (full_data_with_ids, simplified_data)
    
    Raises:
        ValueError: If validation fails for any year/subject/strand
    """
    full_data = []
    simple_data = []
    
    total_years = len(data)
    print(f"\n{'='*60}")
    print(f"Processing {total_years} year levels...")
    print(f"{'='*60}\n")
    
    for year_idx, year_data in enumerate(data, 1):
        # Handle both nested and flat structures
        if 'curriculum' in year_data:
            curriculum = year_data['curriculum']
            programme = curriculum.get('programme', 'Unknown')
            year_num = curriculum.get('year', extract_year_number(programme))
            age_range = curriculum.get('ageRange') or curriculum.get('age_range', '')
            notes = year_data.get('notes', '')
            subjects_list = curriculum.get('subjects', [])
        else:
            programme = year_data.get('programme', 'Unknown')
            year_num = extract_year_number(programme)
            age_range = year_data.get('age_range', '')
            notes = year_data.get('notes', '')
            subjects_list = year_data.get('subjects', [])
        
        print(f"{'='*60}")
        print(f"📚 YEAR {year_idx}/{total_years}: {programme}")
        print(f"{'='*60}")
        
        # VALIDATE YEAR
        print(f"🔍 Validating year structure...")
        try:
            validate_year_data(year_data, year_idx)
            print(f"   ✅ Year structure valid")
        except ValueError as e:
            print(f"\n{e}")
            print(f"   ⛔ VALIDATION FAILED - STOPPING PROCESS")
            raise
        
        # Check optional fields
        print(f"📋 Checking fields:")
        print(f"   • programme: '{programme}'")
        print(f"   • year_number: {year_num}")
        print(f"   • age_range: '{age_range or 'NOT FOUND'}'")
        print(f"   • notes: {'Present' if notes else 'NOT FOUND'}")
        
        # Process full data with IDs
        processed_year = {
            'programme': programme,
            'year_number': year_num,
            'age_range': age_range,
            'notes': notes,
            'subjects': []
        }
        
        # Process simple data (no descriptions)
        simple_year = {
            'programme': programme,
            'year_number': year_num,
            'subjects': []
        }
        
        print(f"\n📚 Processing {len(subjects_list)} subjects...")
        print(f"{'-'*60}")
        
        total_strands_in_year = 0
        
        for subject_idx, subject in enumerate(subjects_list, 1):
            # Handle both 'name' and 'subject_name' keys
            subject_name = subject.get('name') or subject.get('subject_name', 'Unknown')
            subject_description = subject.get('description', '')
            
            # VALIDATE SUBJECT
            print(f"\n   [{subject_idx}/{len(subjects_list)}] Subject: {subject_name}")
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
                'description': subject_description,
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
                # Handle both 'name' and 'strand_name' keys
                strand_name = strand.get('name') or strand.get('strand_name', 'Unknown')
                
                # VALIDATE STRAND
                try:
                    validate_strand_data(strand, strand_idx, subject_name, programme)
                except ValueError as e:
                    print(f"\n{e}")
                    print(f"          ⛔ VALIDATION FAILED - STOPPING PROCESS")
                    raise
                
                strand_id = create_strand_id(subject_name, year_num, strand_name)
                total_strands_in_year += 1
                
                # Check strand fields
                strand_description = strand.get('description') or strand.get('strand_description', '')
                has_description = bool(strand_description.strip())
                
                # Handle both 'subtopics' and 'objectives'
                content_items = strand.get('subtopics') or strand.get('objectives', [])
                content_count = len(content_items)
                content_key = 'subtopics' if 'subtopics' in strand else 'objectives'
                
                print(f"          [{strand_idx}/{len(strands)}] {strand_name}")
                print(f"               • ID: {strand_id}")
                print(f"               • Description: {'✅ Present' if has_description else '⚠️  Empty'}")
                print(f"               • {content_key.title()}: {content_count} items")
                
                # Full version with ID
                processed_strand = {
                    'id': strand_id,
                    'name': strand_name,
                    'description': strand_description,
                    content_key: content_items
                }
                processed_subject['strands'].append(processed_strand)
                
                # Simple version (just ID, name, and content)
                simple_strand = {
                    'id': strand_id,
                    'name': strand_name,
                    content_key: content_items
                }
                simple_subject['strands'].append(simple_strand)
            
            if processed_subject['strands']:
                processed_year['subjects'].append(processed_subject)
                simple_year['subjects'].append(simple_subject)
            
            print(f"       ✅ {len(strands)} strands processed")
        
        full_data.append(processed_year)
        simple_data.append(simple_year)
        
        print(f"{'-'*60}")
        print(f"✅ YEAR {year_idx} COMPLETE")
        print(f"   • Subjects processed: {len(subjects_list)}")
        print(f"   • Total strands: {total_strands_in_year}")
        print(f"   • Progress: {year_idx}/{total_years} years")
        print(f"{'='*60}\n")
    
    print(f"\n{'='*60}")
    print(f"✨ ALL YEARS PROCESSED SUCCESSFULLY!")
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
    print("GCSE/CAMBRIDGE CURRICULUM JSON PROCESSOR")
    print("="*60)
    
    # Load original data
    print(f"\n📂 Loading original curriculum data...")
    print(f"   Path: {INPUT_PATH}")
    
    try:
        with open(INPUT_PATH, 'r', encoding='utf-8') as f:
            original_data = json.load(f)
        print(f"   ✅ Loaded successfully")
        print(f"   ✅ Found {len(original_data)} year entries\n")
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
        import traceback
        traceback.print_exc()
        return
    
    # Calculate statistics
    total_subjects = sum(len(year['subjects']) for year in full_data)
    total_strands = sum(
        len(subject['strands']) 
        for year in full_data 
        for subject in year['subjects']
    )
    
    print(f"📊 STATISTICS")
    print(f"{'='*60}")
    print(f"   Total Years: {len(full_data)} (Years 1-13)")
    print(f"   Total Subjects: {total_subjects}")
    print(f"   Total Strands: {total_strands}")
    print(f"   Average strands per year: {total_strands / len(full_data):.1f}")
    print(f"   Average subjects per year: {total_subjects / len(full_data):.1f}")
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
    for year in full_data[:3]:  # First 3 years
        for subject in year['subjects'][:2]:  # First 2 subjects per year
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
