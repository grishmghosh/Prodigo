from flask import Flask

from app.routes.raw_material_routes import raw_material_bp
from app.routes.supplier_routes import supplier_bp


def create_app():
	app = Flask(__name__)
	app.register_blueprint(raw_material_bp)
	app.register_blueprint(supplier_bp)
	return app
