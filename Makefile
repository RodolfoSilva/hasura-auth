test:
	@docker-compose -f docker-compose-test.yml up --build  --exit-code-from test --remove-orphans -V