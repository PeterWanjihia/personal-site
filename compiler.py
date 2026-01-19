import os
import json
import frontmatter
import markdown2

def compile_system():
    sys_data = {
        "posts": [],
        "projects": []
    }

    # 1. Process Projects (The Registry)
    with open('content/projects/registry.json', 'r') as f:
        sys_data['projects'] = json.load(f)

    # 2. Process Posts (The Logs)
    posts_dir = 'content/posts'
    for filename in os.listdir(posts_dir):
        if filename.endswith('.md'):
            with open(os.path.join(posts_dir, filename), 'r') as f:
                post = frontmatter.load(f)
                # Convert Markdown body to HTML
                html_content = markdown2.markdown(post.content)
                
                sys_data['posts'].append({
                    "metadata": post.metadata,
                    "content": html_content,
                    "slug": filename.replace('.md', '')
                })

    # 3. Sort Posts by Date (Descending)
    sys_data['posts'].sort(key=lambda x: x['metadata']['date'], reverse=True)

    # 4. Output the System State
    with open('sys_data.json', 'w') as f:
        json.dump(sys_data, f, indent=4)
    
    print("System State Compiled: sys_data.json generated.")

if __name__ == "__main__":
    compile_system()