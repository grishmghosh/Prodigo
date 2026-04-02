import uuid

import psycopg2
from flask import Blueprint, jsonify, request
from psycopg2.extras import RealDictCursor

from app.db import get_db_connection


raw_material_bp = Blueprint("raw_material_bp", __name__)


@raw_material_bp.route("/raw-materials", methods=["POST"])
def create_raw_material():
	payload = request.get_json(silent=True) or {}
	name = payload.get("name")
	unit = payload.get("unit")

	if not name or not unit:
		return jsonify({"error": "name and unit are required"}), 400

	raw_material_id = str(uuid.uuid4())
	connection = None
	cursor = None

	try:
		connection = get_db_connection()
		cursor = connection.cursor(cursor_factory=RealDictCursor)
		cursor.execute(
			"""
			INSERT INTO raw_materials (id, name, unit, is_active)
			VALUES (%s, %s, %s, %s)
			RETURNING id, name, unit, is_active
			""",
			(raw_material_id, name, unit, True),
		)
		new_raw_material = cursor.fetchone()
		connection.commit()
		return jsonify(new_raw_material), 201
	except (psycopg2.Error, ValueError) as error:
		if connection:
			connection.rollback()
		return jsonify({"error": str(error)}), 500
	finally:
		if cursor:
			cursor.close()
		if connection:
			connection.close()


@raw_material_bp.route("/raw-materials", methods=["GET"])
def get_raw_materials():
	connection = None
	cursor = None

	try:
		connection = get_db_connection()
		cursor = connection.cursor(cursor_factory=RealDictCursor)
		cursor.execute(
			"""
			SELECT id, name, unit, is_active
			FROM raw_materials
			ORDER BY name ASC
			"""
		)
		raw_materials = cursor.fetchall()
		return jsonify(raw_materials), 200
	except (psycopg2.Error, ValueError) as error:
		return jsonify({"error": str(error)}), 500
	finally:
		if cursor:
			cursor.close()
		if connection:
			connection.close()


@raw_material_bp.route("/raw-materials/<raw_material_id>", methods=["GET"])
def get_raw_material(raw_material_id):
	connection = None
	cursor = None

	try:
		connection = get_db_connection()
		cursor = connection.cursor(cursor_factory=RealDictCursor)
		cursor.execute(
			"""
			SELECT id, name, unit, is_active
			FROM raw_materials
			WHERE id = %s
			""",
			(raw_material_id,),
		)
		raw_material = cursor.fetchone()

		if not raw_material:
			return jsonify({"error": "Raw material not found"}), 404

		return jsonify(raw_material), 200
	except (psycopg2.Error, ValueError) as error:
		return jsonify({"error": str(error)}), 500
	finally:
		if cursor:
			cursor.close()
		if connection:
			connection.close()


@raw_material_bp.route("/raw-materials/<raw_material_id>", methods=["PUT"])
def update_raw_material(raw_material_id):
	payload = request.get_json(silent=True) or {}
	name = payload.get("name")
	unit = payload.get("unit")

	if not name or not unit:
		return jsonify({"error": "name and unit are required"}), 400

	connection = None
	cursor = None

	try:
		connection = get_db_connection()
		cursor = connection.cursor(cursor_factory=RealDictCursor)
		cursor.execute(
			"""
			UPDATE raw_materials
			SET name = %s, unit = %s
			WHERE id = %s
			RETURNING id, name, unit, is_active
			""",
			(name, unit, raw_material_id),
		)
		updated_raw_material = cursor.fetchone()

		if not updated_raw_material:
			connection.rollback()
			return jsonify({"error": "Raw material not found"}), 404

		connection.commit()
		return jsonify(updated_raw_material), 200
	except (psycopg2.Error, ValueError) as error:
		if connection:
			connection.rollback()
		return jsonify({"error": str(error)}), 500
	finally:
		if cursor:
			cursor.close()
		if connection:
			connection.close()


@raw_material_bp.route("/raw-materials/<raw_material_id>", methods=["DELETE"])
def delete_raw_material(raw_material_id):
	connection = None
	cursor = None

	try:
		connection = get_db_connection()
		cursor = connection.cursor(cursor_factory=RealDictCursor)
		cursor.execute(
			"""
			UPDATE raw_materials
			SET is_active = %s
			WHERE id = %s
			RETURNING id, name, unit, is_active
			""",
			(False, raw_material_id),
		)
		deleted_raw_material = cursor.fetchone()

		if not deleted_raw_material:
			connection.rollback()
			return jsonify({"error": "Raw material not found"}), 404

		connection.commit()
		return jsonify(deleted_raw_material), 200
	except (psycopg2.Error, ValueError) as error:
		if connection:
			connection.rollback()
		return jsonify({"error": str(error)}), 500
	finally:
		if cursor:
			cursor.close()
		if connection:
			connection.close()
