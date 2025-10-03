// we try to register here all email domaines used within the administration
// and not ending with ".gouv.fr"
// we ran the following query in production database:
// select unnest(authorized_email_domains) as domain, count(*) from organizations group by domain having count(*) > 10 order by count desc;
// then we removed all .com and .gouv.fr from the list
// then we selected domains manually
export default [
  "conseiller-numerique.fr",
  "justice.fr",
  "justice.fr",
  "francetravail.fr",
  "assurance-maladie.fr",
  "pole-emploi.fr",
  "urssaf.fr",
  "ars.sante.fr",
  "paris.fr",
  "conseiller-numerique.fr",
  "cnrs.fr",
  "caf.fr",
  "i-carre.net",
  "ac-grenoble.fr",
  "ac-nantes.fr",
  "ac-lille.fr",
  "aphp.fr",
  "ac-versailles.fr",
  "ac-rennes.fr",
  "ac-normandie.fr",
  "ac-lyon.fr",
  "marseille.fr",
  "ac-creteil.fr",
  "ac-bordeaux.fr",
  "ac-toulouse.fr",
  "ac-nancy-metz.fr",
  "ac-orleans-tours.fr",
  "ac-clermont.fr",
  "ac-amiens.fr",
  "ac-aix-marseille.fr",
  "ac-paris.fr",
  "asp-public.fr",
  "ac-montpellier.fr",
];
