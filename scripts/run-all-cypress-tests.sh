
npm run build:workspaces

# Utiliser find pour localiser tous les fichiers fixtures.sql et les exécuter
for fixture in $(find cypress/e2e -name "fixtures.sql"); do
  ENABLE_DATABASE_DELETION=True npm run delete-database
  npm run migrate up
  echo "Chargement du fixture: $fixture"
  npm run fixtures:load-ci "$fixture"
  UPDATE_SNAPSHOT=True npm run update-organization-info 0
done

# Mettre à jour les infos de l'organisation
