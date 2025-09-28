#!/usr/bin/env python3
"""
JobSpy Wrapper Script for JAM Backend
Scrapes jobs using the JobSpy library and outputs to JSON
"""

import sys
import json
import argparse
from datetime import datetime
try:
    from JobSpy import scrape_jobs
except ImportError:
    print("Error: JobSpy library not found. Install with: pip install JobSpy", file=sys.stderr)
    sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description='Scrape jobs using JobSpy')
    parser.add_argument('--query', required=True, help='Job search query')
    parser.add_argument('--location', required=True, help='Job location')
    parser.add_argument('--sites', required=True, help='Comma-separated job sites')
    parser.add_argument('--max-jobs', type=int, default=50, help='Maximum jobs to scrape')
    parser.add_argument('--job-type', help='Job type filter')
    parser.add_argument('--experience-level', help='Experience level filter')
    parser.add_argument('--output', required=True, help='Output JSON file path')
    
    args = parser.parse_args()
    
    try:
        print(f"Starting job scrape: {args.query} in {args.location}", file=sys.stderr)
        
        # Convert sites string to list
        sites = [site.strip() for site in args.sites.split(',')]
        
        # Scrape jobs
        jobs_df = scrape_jobs(
            site_name=sites,
            search_term=args.query,
            location=args.location,
            results_wanted=args.max_jobs,
            hours_old=168,  # Jobs from last week
            country_indeed='USA'  # Default country
        )
        
        if jobs_df is not None and not jobs_df.empty:
            # Convert DataFrame to JSON-serializable format
            jobs_data = []
            for _, row in jobs_df.iterrows():
                job_data = {
                    'title': str(row.get('title', '')),
                    'company': str(row.get('company', '')),
                    'company_url': str(row.get('company_url', '')) if pd.notna(row.get('company_url')) else None,
                    'job_url': str(row.get('job_url', '')),
                    'location': str(row.get('location', '')),
                    'city': str(row.get('city', '')) if pd.notna(row.get('city')) else None,
                    'state': str(row.get('state', '')) if pd.notna(row.get('state')) else None,
                    'country': str(row.get('country', '')) if pd.notna(row.get('country')) else None,
                    'is_remote': bool(row.get('is_remote', False)),
                    'job_type': str(row.get('job_type', '')) if pd.notna(row.get('job_type')) else None,
                    'date_posted': str(row.get('date_posted', datetime.now().isoformat())),
                    'description': str(row.get('description', ''))[:5000],  # Limit description length
                    'site': str(row.get('site', 'unknown')),
                    'job_level': str(row.get('job_level', '')) if pd.notna(row.get('job_level')) else None,
                    'company_industry': str(row.get('company_industry', '')) if pd.notna(row.get('company_industry')) else None,
                    'salary_source': str(row.get('salary_source', '')) if pd.notna(row.get('salary_source')) else None,
                }
                
                # Handle compensation data
                if pd.notna(row.get('min_amount')) or pd.notna(row.get('max_amount')):
                    job_data['compensation'] = {
                        'min_amount': float(row.get('min_amount')) if pd.notna(row.get('min_amount')) else None,
                        'max_amount': float(row.get('max_amount')) if pd.notna(row.get('max_amount')) else None,
                        'interval': str(row.get('interval', 'yearly')) if pd.notna(row.get('interval')) else 'yearly',
                        'currency': str(row.get('currency', 'USD')) if pd.notna(row.get('currency')) else 'USD'
                    }
                
                jobs_data.append(job_data)
            
            # Write to output file
            with open(args.output, 'w', encoding='utf-8') as f:
                json.dump(jobs_data, f, indent=2, ensure_ascii=False)
            
            print(f"Successfully scraped {len(jobs_data)} jobs", file=sys.stderr)
            
        else:
            print("No jobs found", file=sys.stderr)
            # Write empty array
            with open(args.output, 'w', encoding='utf-8') as f:
                json.dump([], f)
                
    except Exception as e:
        print(f"Error during job scraping: {str(e)}", file=sys.stderr)
        # Write empty array on error
        with open(args.output, 'w', encoding='utf-8') as f:
            json.dump([], f)
        sys.exit(1)

if __name__ == '__main__':
    try:
        import pandas as pd
        main()
    except ImportError:
        print("Error: Required libraries not found. Install with: pip install JobSpy pandas", file=sys.stderr)
        sys.exit(1)
