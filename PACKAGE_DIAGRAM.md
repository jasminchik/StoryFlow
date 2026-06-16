# UML-діаграма пакетів архітектури StoryFlow

Ось код для PlantUML, що описує структуру пакетів вашої системи:

```plantuml
@startuml
title Рис. 2.3.1 – UML-діаграма пакетів архітектури інформаційної системи «StoryFlow»

skinparam packageStyle rectangle
skinparam linetype ortho

package "Frontend (React Application)" as FE {
    package "Components" as FEC #LightBlue {
        [UI Elements]
        [SearchOverlay]
        [InteractionSection]
    }
    package "Pages" as FEP #LightBlue {
        [CatalogPage]
        [ProfilePage]
        [DetailsPage]
    }
    package "Context API" as FECTX #LightBlue {
        [AuthContext]
        [ThemeContext]
    }
    package "Styles" as FES #LightBlue {
        [SCSS Modules]
    }
}

package "Backend (Node.js API)" as BE {
    package "Routes" as BER #LightGreen {
        [authRoutes]
        [mangaRoutes]
        [userRoutes]
    }
    package "Middleware" as BEM #LightGreen {
        [authMiddleware]
        [uploadConfig]
    }
    package "Models" as BEMD #LightGreen {
        [UserSchema]
        [MangaSchema]
        [ChapterSchema]
    }
    package "Controller Logic" as BEC #LightGreen {
        [Business Logic]
    }
}

package "Database Layer" as DB {
    package "MongoDB" as MDB #Khaki {
        database "StoryFlow DB"
    }
}

package "Infrastructure" as INF {
    [Docker Compose]
    [Persistent Volumes]
}

' Relationships
FE ..> BE : HTTP/REST API Requests
BE ..> DB : Mongoose ODM Queries
BE ..> INF : Containerization
FE ..> INF : Containerization

FEP --> FEC : Uses
FEP --> FECTX : Subscribes
FEC --> FES : Applies

BER --> BEM : Uses
BER --> BEC : Delegates
BEC --> BEMD : Persists

@enduml
```

### Що відображає ця діаграма:
1.  **Frontend**: Розбиття на компоненти, сторінки, контекст (стан) та стилі.
2.  **Backend**: Розподіл на маршрути (Routes), посередників (Middleware), моделі даних (Models) та бізнес-логіку.
3.  **Database**: Рівень збереження даних (MongoDB).
4.  **Infrastructure**: Docker-контейнеризація, яка об'єднує всі частини.
5.  **Зв'язки**: Показує, як дані течуть від користувача через API до бази даних.
