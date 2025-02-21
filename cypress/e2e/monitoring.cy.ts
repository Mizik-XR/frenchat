
describe('Tests E2E - Monitoring', () => {
  beforeEach(() => {
    cy.visit('/');
    // Simuler une connexion si nécessaire
    cy.intercept('POST', '/auth/v1/token', {
      statusCode: 200,
      body: { access_token: 'fake-token' }
    });
  });

  it('devrait afficher les graphiques de monitoring', () => {
    // Intercepter l'appel API des rapports système
    cy.intercept('GET', '**/rest/v1/system_reports*', {
      statusCode: 200,
      fixture: 'systemReports.json'
    }).as('getReports');

    // Naviguer vers la page de monitoring
    cy.visit('/monitoring');

    // Vérifier que les graphiques sont affichés
    cy.get('[data-cy="success-rate-chart"]').should('be.visible');
    cy.get('[data-cy="cache-stats-chart"]').should('be.visible');

    // Vérifier les éléments interactifs
    cy.get('.recharts-tooltip').should('exist');
    cy.get('.recharts-line').should('have.length', 4);
  });

  it('devrait gérer les erreurs de chargement', () => {
    // Simuler une erreur lors du chargement des données
    cy.intercept('GET', '**/rest/v1/system_reports*', {
      statusCode: 500,
      body: { error: 'Internal Server Error' }
    }).as('getReportsError');

    cy.visit('/monitoring');

    // Vérifier que le message d'erreur est affiché
    cy.get('[role="alert"]').should('be.visible');
    cy.contains('Erreur lors du chargement des métriques système').should('be.visible');
  });

  it('devrait rafraîchir les données périodiquement', () => {
    let callCount = 0;
    cy.intercept('GET', '**/rest/v1/system_reports*', (req) => {
      callCount++;
      req.reply({
        statusCode: 200,
        body: {
          // ... données de test
        }
      });
    }).as('getReportsRefresh');

    cy.visit('/monitoring');
    cy.wait('@getReportsRefresh');

    // Attendre le rafraîchissement automatique
    cy.wait(65000); // 65 secondes pour être sûr de voir le rafraîchissement
    cy.wrap(callCount).should('be.gt', 1);
  });
});
