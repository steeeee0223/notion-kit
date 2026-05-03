const fs = require('fs');

const files = [
  'examples/notion-clone/package.json',
  'examples/notion-table/package.json',
  'packages/table-view/package.json',
  'apps/storybook/package.json',
  'apps/docs/package.json',
  'apps/auth-server/package.json',
  'apps/e2e/package.json',
];

const deletedPackages = [
  '@notion-kit/shadcn', '@notion-kit/common', '@notion-kit/cover',
  '@notion-kit/icon-block', '@notion-kit/icon-menu', '@notion-kit/navbar',
  '@notion-kit/sidebar', '@notion-kit/single-image-dropzone',
  '@notion-kit/tags-input', '@notion-kit/timeline', '@notion-kit/tree',
  '@notion-kit/unsplash', '@notion-kit/selectable'
];

files.forEach(f => {
  const data = JSON.parse(fs.readFileSync(f, 'utf8'));
  let changed = false;
  ['dependencies', 'devDependencies'].forEach(depType => {
    if (data[depType]) {
      deletedPackages.forEach(pkg => {
        if (data[depType][pkg]) {
          delete data[depType][pkg];
          data[depType]['@notion-kit/ui'] = 'workspace:*';
          changed = true;
        }
      });
    }
  });
  if (changed) {
    fs.writeFileSync(f, JSON.stringify(data, null, 2) + '\n');
  }
});
