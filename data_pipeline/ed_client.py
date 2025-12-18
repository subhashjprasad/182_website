"""Ed API client wrapper for fetching course data."""
import time
from typing import List, Dict, Any, Optional
from edapi import EdAPI
from tqdm import tqdm
import config


class EdClient:
    """Wrapper for Ed API with rate limiting and error handling."""
    
    def __init__(self):
        """Initialize Ed API client."""
        if not config.ED_API_TOKEN:
            raise ValueError("ED_API_TOKEN not set in environment")

        self.api = EdAPI()
        self.api.login()  # Logs in using ED_API_TOKEN from .env
        self.course_id = config.COURSE_ID
        
    def fetch_all_threads(self, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """
        Fetch all threads from the course.
        
        Args:
            limit: Optional limit on number of threads to fetch
            
        Returns:
            List of thread dictionaries
        """
        print(f"Fetching threads from course {self.course_id}...")
        threads = []
        offset = 0
        batch_size = 30
        
        while True:
            try:
                batch = self.api.list_threads(
                    course_id=self.course_id,
                    limit=batch_size,
                    offset=offset
                )

                if not batch:
                    break

                threads.extend(batch)
                print(f"  Fetched {len(threads)} threads so far...")

                if limit and len(threads) >= limit:
                    threads = threads[:limit]
                    break

                # Check if we've fetched all threads
                if len(batch) < batch_size:
                    break
                    
                offset += batch_size
                time.sleep(0.5)  # Rate limiting
                
            except Exception as e:
                print(f"Error fetching threads at offset {offset}: {e}")
                break
        
        print(f"Total threads fetched: {len(threads)}")
        return threads
    
    def filter_participation_b_threads(
        self, 
        threads: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Filter threads to only those related to Special Participation B.
        
        Args:
            threads: List of all threads
            
        Returns:
            Filtered list of participation B threads
        """
        filtered = []
        
        for thread in threads:
            title = thread.get('title', '').lower()
            
            # Check if title contains any of the participation B keywords
            for keyword in config.PARTICIPATION_B_KEYWORDS:
                if keyword.lower() in title:
                    filtered.append(thread)
                    break
        
        print(f"Filtered to {len(filtered)} participation B threads")
        return filtered
    
    def fetch_thread_details(self, thread_number: int) -> Optional[Dict[str, Any]]:
        """
        Fetch full details for a specific thread including all posts.

        Args:
            thread_number: The thread number (not ID) to fetch

        Returns:
            Thread details dictionary or None if error
        """
        try:
            details = self.api.get_course_thread(self.course_id, thread_number)
            time.sleep(0.3)  # Rate limiting
            return details
        except Exception as e:
            print(f"Error fetching thread {thread_number}: {e}")
            return None
    
    def download_attachment(
        self, 
        attachment_url: str, 
        save_path: str
    ) -> bool:
        """
        Download an attachment from Ed.
        
        Args:
            attachment_url: URL of the attachment
            save_path: Local path to save the file
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # This would need to be implemented with the actual Ed API
            # For now, we'll just note that attachments need manual download
            # or a different API method
            print(f"Note: Attachment download not yet implemented: {attachment_url}")
            return False
        except Exception as e:
            print(f"Error downloading attachment: {e}")
            return False


def test_connection():
    """Test Ed API connection and fetch sample data."""
    try:
        client = EdClient()
        print("✓ Ed API client initialized successfully")
        
        # Fetch first few threads as a test
        threads = client.fetch_all_threads(limit=5)
        print(f"✓ Successfully fetched {len(threads)} sample threads")
        
        if threads:
            print("\nSample thread titles:")
            for i, thread in enumerate(threads[:3], 1):
                print(f"  {i}. {thread.get('title', 'N/A')}")
        
        # Try filtering for participation B
        participation_threads = client.filter_participation_b_threads(threads)
        print(f"\n✓ Found {len(participation_threads)} participation B threads in sample")
        
        return True
        
    except Exception as e:
        print(f"✗ Error testing Ed API connection: {e}")
        print("\nMake sure you have:")
        print("  1. Created a .env file with your ED_API_TOKEN")
        print("  2. Set COURSE_ID=84647 in .env")
        return False


if __name__ == "__main__":
    test_connection()
