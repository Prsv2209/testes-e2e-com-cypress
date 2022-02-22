/// <reference types="Cypress" />
it('successfully signs up using confirmation code sent via email', () => {
    
    //Estou importando o faker para dentro do teste 
    const faker = require('faker')

    //Estou criando uma variável que vai contar um email gerado pelo faker @ o SERVER ID do MAILOSAUR
    const emailAddress = `${faker.datatype.uuid()}@${Cypress.env('MAILOSAUR_SERVER_ID')}.mailosaur.net`
    const password = Cypress.env('USER_PASSWORD')
    
    //Estou pedidndo ao Cypress para interceptar uma requisição do tipo GET com qualquer coisa com NOTES dei o nome de getNotes
    cy.intercept('GET', '**/notes').as('getNotes')

    //Estou chamando um comando criado no arquivo commands na pasta supoort para que seja preechido o formulário do site
    //Estou passando como parametro os email e password gerados no faker junto com MAILOSAUR
    cy.fillSignupFormAndSubmit(emailAddress, password)

    //Estou executando um comando do plugin MAILOSAUR para que ele acesse o serv criado no MAILOSAUR e atraves do comando
    //Then ele pegue o código de confirmação do email.
    cy.mailosaurGetMessage(Cypress.env('MAILOSAUR_SERVER_ID'), {
      sentTo: emailAddress
    }).then(message => {
      const confirmationCode = message.html.body.match(/\d{6}/)[0]
      cy.get('#confirmationCode').type(`${confirmationCode}{enter}`)
      cy.wait(10000)
      cy.wait('@getNotes')
      cy.contains('h1', 'Your Notes').should('be.visible')
    })
  })