# Stage 1: Build the application
FROM gradle:8.4-jdk17 AS build
WORKDIR /app
COPY . .
RUN ./gradlew build -x test

# Stage 2: Run the application
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
