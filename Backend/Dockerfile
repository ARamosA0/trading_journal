# syntax=docker/dockerfile:1

FROM maven:3.9.9-eclipse-temurin-21-noble AS build

WORKDIR /workspace

COPY pom.xml ./
RUN --mount=type=cache,target=/root/.m2 \
    mvn --batch-mode --no-transfer-progress dependency:go-offline

COPY src ./src
RUN --mount=type=cache,target=/root/.m2 \
    mvn --batch-mode --no-transfer-progress -DskipTests package

FROM eclipse-temurin:21.0.12.1_1-jre-noble AS runtime

LABEL org.opencontainers.image.source="https://github.com/ARamosA0/trading_journal"

RUN groupadd --system --gid 10001 app \
    && useradd --system --uid 10001 --gid app --home-dir /app --shell /usr/sbin/nologin app \
    && mkdir -p /app \
    && chown app:app /app

WORKDIR /app
COPY --from=build --chown=10001:10001 /workspace/target/portfolio-*.jar /app/app.jar

EXPOSE 8080

USER 10001:10001
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75.0", "-jar", "/app/app.jar"]
