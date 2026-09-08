# MSAI Portfolio

The public site for student work in the **MS in Artificial Intelligence** at Atlantis
University. Each student owns one folder and one page.

**Live:** https://rodolfocapdevilla-au.github.io/msai-portfolio/

## Layout

```
index.html          the front page — links to every student
assets/style.css    the shared design. Do not edit in a student PR.
_template/          the starting page. Copy it; do not edit it in place.
students/
  <your-name>/      your folder. The only place you make changes.
    index.html
    photo.jpg
```

## Students — the whole workflow

```bash
gh repo clone rodolfocapdevilla-au/msai-portfolio
cd msai-portfolio
git checkout -b student/firstname-lastname
cp -r _template students/firstname-lastname
# edit students/firstname-lastname/index.html
git add students/firstname-lastname
git commit -m "Add Your Name page"
git push -u origin student/firstname-lastname
gh pr create --title "Add Your Name page" --body "First version of my page."
```

Then paste the pull request URL in the class chat.

## The one rule

**Only ever edit inside your own folder.** Everything else — `index.html`, `assets/style.css`,
`_template/` — is shared. If you think one of them needs changing, open an issue and say so
rather than changing it in your pull request.

Because everyone works in a separate folder, merge conflicts are nearly impossible. That is by
design, not luck.

## Instructor — on merge

1. Review the PR. Check: photo under 500 KB, all four links resolve, no placeholder text left,
   project cards say what the student did.
2. Merge.
3. Uncomment that student's card in `index.html` on `main` and push. Cards are pre-written and
   commented out, in roster order.
4. GitHub Pages rebuilds automatically, in about a minute.
