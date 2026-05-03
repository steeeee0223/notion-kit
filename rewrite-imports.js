const fs = require('fs');
const path = require('path');

const walk = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk(process.argv[2]);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  content = content.replace(/@notion-kit\/shadcn/g, '~/primitives');
  content = content.replace(/@notion-kit\/common\/([a-zA-Z0-9-]+)/g, '~/$1');
  content = content.replace(/@notion-kit\/common/g, '~/common');
  content = content.replace(/@notion-kit\/icon-block/g, '~/icon-block');
  content = content.replace(/@notion-kit\/icon-menu/g, '~/icon-menu');
  content = content.replace(/@notion-kit\/cover/g, '~/cover');
  content = content.replace(/@notion-kit\/navbar/g, '~/navbar');
  content = content.replace(/@notion-kit\/sidebar/g, '~/sidebar');
  content = content.replace(/@notion-kit\/single-image-dropzone/g, '~/single-image-dropzone');
  content = content.replace(/@notion-kit\/tags-input/g, '~/tags-input');
  content = content.replace(/@notion-kit\/timeline/g, '~/timeline');
  content = content.replace(/@notion-kit\/tree/g, '~/tree');
  content = content.replace(/@notion-kit\/unsplash/g, '~/unsplash');
  content = content.replace(/@notion-kit\/selectable/g, '~/selectable');

  if (content !== original) {
    fs.writeFileSync(file, content);
  }
});
