# MeuDisci - Especificação Completa do Sistema

## Visão Geral

MeuDisci é um sistema PWA (Progressive Web App) para acompanhamento de discipulados.

Objetivos:

* Permitir que discípulos acompanhem seus discipulados.
* Integrar com Google Calendar Appointment Schedule.
* Utilizar Google Sheets como banco de dados.
* Possuir painel administrativo para discipuladores.
* Ser mobile-first.
* Ser instalável como aplicativo.

---

# Stack Tecnológica

Frontend:

* HTML5
* CSS3
* JavaScript Vanilla

Backend:

* Google Apps Script

Banco de Dados:

* Google Sheets

Agenda:

* Google Calendar

Hospedagem:

* Google Apps Script Web App

PWA:

* Manifest
* Service Worker

---

# Configurações

## Planilha

Spreadsheet ID:

1wyEdDTtfF8JcwP1DMHZaSFEQ_zUGsfDl6eaazXYsGnw

Nome da Aba:

CONTROLE_DISCI

---

## Google Calendar

Calendar ID:

[srscoiado@gmail.com](mailto:srscoiado@gmail.com)

Link de Agendamento:

https://calendar.app.google/nQ3mBZhqoTFhUNNp7

---

## Administrador

Usuário:

guiele

Senha:

1609prasempre

---

# Estrutura da Planilha

Colunas obrigatórias:

1. Discipulos
2. Email:
3. Sigla Acesso
4. Senha Acesso
5. Discipulador (es)
6. Líder?
7. Último Disci
8. Próximo Disci
9. Ultimo Tópico
10. Meta da Semana
11. Calendar Event ID

---

# Perfis de Usuário

## Discípulo

Login:

* Sigla Acesso
* Senha Acesso

Permissões:

Pode visualizar:

* Nome
* Discipulador(es)
* Último Disci
* Próximo Disci
* Meta da Semana

Pode executar:

* Abrir página de agendamento

Não pode visualizar:

* Email
* Líder?
* Ultimo Tópico
* Calendar Event ID
* Outros discípulos

---

## Discipulador

Login:

Usuário: guiele

Senha: 1609prasempre

Permissões:

Visualizar:

* Todos os discípulos
* Todas as colunas

Editar:

* Ultimo Tópico
* Meta da Semana

---

# Dashboard do Discípulo

## Cabeçalho

Exibir:

Olá, {nome}

---

## Informações

Card:

Discipulador(es)

Card:

Último Disci

Card:

Próximo Disci

---

## Meta da Semana

Card destacado.

Exemplo:

Meta da Semana

Ler João capítulos 1 a 3.

---

## Agendamento

Botão:

AGENDAR DISCIPULADO

Ação:

Abrir:

https://calendar.app.google/nQ3mBZhqoTFhUNNp7

Nova aba.

---

## Sem Agendamento

Quando Próximo Disci estiver vazio:

Exibir alerta:

"⚠️ Hey, você não possui discipulado agendado. Agende agora para não acabar deixando passar."

---

# Dashboard Administrativo

## Cards

Total de discípulos

Agendados

Sem agenda

---

## Lista de Discípulos

Cada registro deve exibir:

* Nome
* Email
* Discipulador(es)
* Líder?
* Último Disci
* Próximo Disci

---

## Edição

Textarea:

Ultimo Tópico

Botão:

Salvar

---

Textarea:

Meta da Semana

Botão:

Salvar

---

# Integração com Google Calendar

## Objetivo

Detectar automaticamente agendamentos realizados.

---

## Processo

A cada 15 minutos:

1. Ler eventos futuros.
2. Ler convidados dos eventos.
3. Comparar convidados com coluna Email:
4. Encontrar discípulo correspondente.
5. Atualizar:

* Próximo Disci
* Calendar Event ID

---

## Reagendamento

Se o evento mudar:

Atualizar automaticamente:

Próximo Disci

---

## Cancelamento

Se o evento não existir:

Limpar:

* Próximo Disci
* Calendar Event ID

---

## Conclusão do Discipulado

Quando o horário passar:

Mover:

Próximo Disci

para

Último Disci

Depois limpar:

* Próximo Disci
* Calendar Event ID

---

# Sessão

Autenticação via Apps Script.

Fluxo:

Login
↓
Token
↓
LocalStorage
↓
Dashboard

Validade:

6 horas.

---

# Estrutura de Arquivos

/appsscript

Code.gs

Auth.gs

CalendarSync.gs

Sheets.gs

Admin.gs

/frontend

index.html

app.js

style.css

manifest.json

service-worker.js

icons/

icon-192.png

icon-512.png

---

# Design

Mobile First.

Cores:

Primária:

#2563EB

Background:

#F5F7FB

Cards:

#FFFFFF

Texto:

#1F2937

---

# Componentes

Cards

Botões arredondados

Inputs arredondados

Sombras suaves

Responsivo

---

# PWA

Manifest:

Nome:

MeuDisci

Short Name:

MeuDisci

Display:

standalone

Theme Color:

#2563EB

Background Color:

#FFFFFF

---

# Service Worker

Cache:

* index.html
* app.js
* style.css
* manifest.json

Permitir:

* Instalação Android
* Instalação iPhone

---

# Triggers Apps Script

Executar uma vez:

createTriggers()

Criar:

syncCalendarEvents()

a cada 15 minutos

processFinishedDiscipleships()

a cada 1 hora

---

# Melhorias Futuras

* Notificações Push
* Histórico completo de discipulados
* Upload de anotações
* Relatórios PDF
* Dashboard por discipulador
* Ranking de acompanhamento
* Integração WhatsApp
* Integração Telegram
* Modo escuro

---

# Critério de Conclusão

O sistema será considerado concluído quando:

✓ Login de discípulo funcionar

✓ Login admin funcionar

✓ Dashboard discípulo funcionar

✓ Dashboard admin funcionar

✓ Meta da Semana puder ser editada

✓ Ultimo Tópico puder ser editado

✓ Agendamento abrir Google Calendar

✓ Sincronização automática funcionar

✓ PWA instalável funcionar

✓ Funcionar em Android e iPhone
