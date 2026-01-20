import os
import json
import frontmatter
import markdown2

def compile_system():
    sys_data = {
        "identity": {}, # New: Structured About Data
        "posts": [],
        "projects": []
    }

    # 1. Process Identity (The About/CV Logic)
    try:
        with open('content/about.json', 'r') as f:
            sys_data['identity'] = json.load(f)
    except FileNotFoundError:
        print("Warning: content/about.json not found. Identity state will be empty.")

    # 2. Process Projects (The Registry)
    with open('content/projects/registry.json', 'r') as f:
        sys_data['projects'] = json.load(f)

    # 3. Process Posts (The Logs)
    posts_dir = 'content/posts'
    for filename in os.listdir(posts_dir):
        if filename.endswith('.md'):
            with open(os.path.join(posts_dir, filename), 'r') as f:
                post = frontmatter.load(f)
                html_content = markdown2.markdown(post.content)
                
                sys_data['posts'].append({
                    "metadata": post.metadata,
                    "content": html_content,
                    "slug": filename.replace('.md', '')
                })

    # 4. Sort Posts by Date
    sys_data['posts'].sort(key=lambda x: x['metadata']['date'], reverse=True)

    # 5. Output the System State
    with open('sys_data.json', 'w') as f:
        json.dump(sys_data, f, indent=4)
    
    print("System State Compiled: sys_data.json generated.")

if __name__ == "__main__":
    compile_system()