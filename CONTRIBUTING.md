# How to add or change your page

## Every time you sit down to work

```bash
cd msai-portfolio
git checkout main
git pull
git checkout student/firstname-lastname
git merge main
```

That brings you up to date with everyone else's merged work before you start.

## Making a change

Edit **only** files inside `students/<your-name>/`, then:

```bash
git add students/<your-name>
git commit -m "Say what changed, in a few words"
git push
```

If your pull request is still open, pushing updates it. **Do not open a second one.**

## What gets sent back

| Reason | Fix |
|---|---|
| Photo over 500 KB | Resize to 800 px on the longest side |
| A link that does not open | Check it starts with `https://` and works logged out |
| Placeholder text left in | Search your file for `CHANGE-ME`, `Your Name`, `placeholder` |
| Name spelled inconsistently | Page title, `<h1>`, nav badge and folder name should all agree |
| A file outside your folder | Move it inside `students/<your-name>/` |

## Images

Keep every image inside your own folder, under 300 KB, longest side 800 px. An image saved
anywhere else is the one thing that reliably causes a conflict with a classmate.

## Asking for help

Paste the command **and** the full error into the class chat. If one person hit it, others are
about to.
