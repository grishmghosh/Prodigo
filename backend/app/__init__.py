from flask import Flask

from app.routes.supplier_routes import supplier_bp


def create_app():
	app = Flask(__name__)
	app.register_blueprint(supplier_bp)
	return app
