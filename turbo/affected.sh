app="@notion-kit/$1"
affected=$(pnpm exec turbo query affected --packages $app --base HEAD)
count=$(echo "$affected" | jq '.data.affectedPackages.length')

if [ "$count" -gt 0 ]; then
  echo "[$app] $count package(s) affected, proceeding with build..."
else
  echo "[$app] not affected, skipping."
  exit 0
fi