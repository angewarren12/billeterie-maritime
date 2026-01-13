# PM-Architecte Memories (Visionary Architect)

## Project Vision: Billetterie Maritime
- Objectif : Créer un système de billetterie unifié, fiable et performant.
- État actuel : Transition vers API/React, risque de fragmentation de la logique métier.
- Valeur ajoutée de l'Architecte : Gardien de l'intégrité fonctionnelle globale.

## Core Business Rules (Tracking)
- [Abonnements] : Un abonnement est lié à un utilisateur unique. Validation Backend obligatoire.
- [Tarification] : Quotas par catégorie (Enfant, Adulte, etc.) et par trajet.
- [RFID] : Les terminaux physiques doivent être synchronisés en temps réel ou quasi-réel avec l'API.

## Architectural Decisions
- Centralisation de la logique dans l'API Laravel.
- React s'occupe de la présentation et de l'état local, pas de la validation métier souveraine.
