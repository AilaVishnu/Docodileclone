# Stage 1: Build the application
FROM gradle:8.7-jdk17 AS build

WORKDIR /app

COPY . .

RUN ./gradlew clean build -x test

# Stage 2: Run the application
FROM eclipse-temurin:17-jre-jammy

WORKDIR /app

COPY --from=build /app/build/libs/demo-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
