
import * as util from 'util';
import * as fs from 'fs';
import * as path from 'path';



import { JSONTYPES, RELATION_TYPE, AGGREGATION_KIND } from './schema-consts';
import { merge, clone } from '../utils/helper'
import * as promises from '../utils/promises'

import { ApplicationError } from '../utils/errors'


const
    DEFINITION_STRING = '#/definitions/',
    DEFINITION_STRING_LEN = DEFINITION_STRING.length;


export function typeOfProperty(propSchema: { type?: string, format?: string, reference?: string }): string {
    let ps = propSchema.type || JSONTYPES.string;
    if (!JSONTYPES[ps])
        throw new ApplicationError(util.format('Unsupported schema type : "%s"', propSchema.type));
    if (propSchema.format) {
        if (ps === JSONTYPES.string) {
            if (propSchema.format === JSONTYPES.date)
                return JSONTYPES.date;
            else if (propSchema.format === JSONTYPES.datetime)
                return JSONTYPES.datetime;
            else if (propSchema.format === JSONTYPES.id)
                return JSONTYPES.id;
        } else if (ps === JSONTYPES.integer) {
            if (propSchema.format === JSONTYPES.id)
                return JSONTYPES.id;

        }
    }
    return ps;
}

export function isHidden(propSchema: any): boolean {
    return propSchema.isHidden === true;
}

export function isReadOnly(propSchema: any): boolean {
    return (propSchema.generated === true || propSchema.isReadOnly === true);
}


export function isComplex(schema: any) {
    return (schema.type === JSONTYPES.array || schema.type === JSONTYPES.object);
}

export function expandSchema(schema: any, model: any) {
    _expand$Ref(schema, [], model, schema.definitions);
}


export function updateRoleRefs(role: any, localModel: any, foreignModel: any, useInv: boolean) {
    if (!localModel) return;
    if (!role) return;
    if (useInv) {
        if (role.foreignFields && role.foreignFields.length)
            role.foreignFields.forEach((field: string, index: number) => {
                let ff = role.localFields[index];
                if (foreignModel)
                    localModel[field] = foreignModel[ff]
                else
                    delete localModel[field];
            });
    } else {
        if (role.localFields && role.localFields.length)
            role.localFields.forEach((field: string, index: number) => {
                let ff = role.foreignFields[index];
                if (foreignModel)
                    localModel[field] = foreignModel[ff]
                else
                    delete localModel[field];
            });
    }
}
export function roleToQueryInv(role: any, localModel: any): any {
    let query: any = {}, valueIsNull = false;
    if (!role.foreignFields) return null;
    role.foreignFields.forEach((field: string, index: number) => {
        if (valueIsNull) return;
        let ff = role.localFields[index];
        let value = localModel[ff];
        if (value === null || value === '' || value === undefined)
            valueIsNull = true;
        else
            query[field] = value;
    });
    if (valueIsNull) query = null;
    return query;
}

export function roleToQuery(role: any, localModel: any): any {
    let query: any = {}, valueIsNull = false;
    if (!role.localFields) return null;
    role.localFields.forEach((field: string, index: number) => {
        let ff = role.foreignFields[index];
        let value = localModel[field];
        if (value === null || value === '' || value === undefined)
            valueIsNull = true;
        else
            query[ff] = value;
    });
    if (valueIsNull) query = null;
    return query;
}

export function enumCompositions(relations: any, cb: (relationName: string, relation: any) => void) {
    relations && Object.keys(relations).forEach(relationName => {
        let relation = relations[relationName];
        if (relation.aggregationKind === AGGREGATION_KIND.composite && (relation.type === RELATION_TYPE.hasOne || relation.type === RELATION_TYPE.hasMany)) {
            cb(relationName, relation);
        }
    });

}

export function getChildrenAndRefsOfClass(schema: any): { children: string[], refs: string[] } {
    let deps: { children: string[], refs: string[] } = { children: [], refs: [] };
    schema.relations && Object.keys(schema.relations).forEach(relationName => {
        let relation = schema.relations[relationName];
        switch (relation.type) {
            case RELATION_TYPE.hasOne:
                if (relation.aggregationKind === AGGREGATION_KIND.composite)
                    deps.children.push((relation.nameSpace || schema.nameSpace) + '.' + relation.model);
                else if (relation.aggregationKind === AGGREGATION_KIND.none)
                    deps.refs.push((relation.nameSpace || schema.nameSpace) + '.' + relation.model);

                break;
            case RELATION_TYPE.hasMany:
                if (relation.aggregationKind === AGGREGATION_KIND.composite)
                    deps.children.push((relation.nameSpace || schema.nameSpace) + '.' + relation.model);
                break;
            case RELATION_TYPE.belongsTo:
                if (relation.aggregationKind === AGGREGATION_KIND.shared)
                    deps.refs.push((relation.nameSpace || schema.nameSpace) + '.' + relation.model);

                break;
        }
    });
    return deps;
}

export function isChild(schema: any): boolean {
    return !!(schema && schema.meta && schema.meta.parent);
}




function idDefinition(): any {
    return { type: JSONTYPES.integer, generated: true, format: JSONTYPES.id };
}

function refIdDefinition(): any {
    return { type: JSONTYPES.integer, isReadOnly: true, format: JSONTYPES.id };
}



// reference :
// schema_name"
// schema_name.json"
// schema.json#/definitions/definition_name"
// #/definitions/definition_name"

function _load$ref(reference: string, model: any, definitions: any): any {
    let ii = reference.indexOf(DEFINITION_STRING);
    let schemaId, defName: string;
    if (ii >= 0) {
        schemaId = reference.substr(0, ii);
        defName = reference.substr(ii + DEFINITION_STRING_LEN);
    } else
        schemaId = reference;
    if (schemaId) {
        ii = schemaId.indexOf('.json');
        if (ii >= 0)
            schemaId = schemaId.substr(0, ii);
    }
    if (!schemaId && !defName)
        throw new ApplicationError(util.format('Unsupported schema $ref : "%s"', reference));
    let ref, def = definitions;
    if (schemaId) {
        ref = model[schemaId];
        if (!ref)
            throw new ApplicationError(util.format('Schema not found "%s". ($ref : "%s")', schemaId, reference));
        if (defName)
            def = model[schemaId].definitions;
        else
            ref = clone(model[schemaId]);
    }

    if (defName && (!def || !def[defName]))
        throw new ApplicationError(util.format('Definition not found "%s". ($ref : "%s")', defName, reference));
    if (defName)
        ref = clone(def[defName]);
    return ref;
}


function _toMerge(item: any, callStack: string[], model: any, definitions: any): void {
    let toMerge = null;
    if (item.allOf) {
        toMerge = item.allOf;
        delete item.allOf;
    } else if (item.$ref) {
        if (callStack.indexOf(item.$ref) < 0) {
            toMerge = [{ $ref: item.$ref }]
            delete item.$ref;
        }
    }
    if (toMerge) {
        toMerge.forEach(function (ci: any) {
            let newCallStack = callStack.slice(0);
            if (ci.$ref) {
                let ref = _load$ref(ci.$ref, model, definitions);
                newCallStack.push(ci.$ref);
                delete ci.$ref;
                merge(ref, ci);
            }
            _expand$Ref(ci, newCallStack, model, definitions);
            merge(ci, item);
        });
    }

}


function _expand$Ref(item: any, callStack: string[], model: any, definitions: any): void {
    let currentCallStack = callStack.slice(0);
    _toMerge(item, currentCallStack, model, definitions);
    let toExpand: any = null;
    if (item.properties) {
        toExpand = item;
    } else if (item.type === JSONTYPES.array && item.items) {
        toExpand = item.items;
    }
    if (toExpand && toExpand.properties) {
        Object.keys(toExpand.properties).forEach(name => {
            let prop = toExpand.properties[name];
            if (prop.allOf || prop.$ref)
                _toMerge(prop, callStack, model, definitions);
            if (prop.type === JSONTYPES.array && prop.items) {
                if (prop.items.allOf || prop.items.$ref)
                    _toMerge(prop.items, callStack, model, definitions);
            }
        });
    }
}



async function loadJsonFromFile(jsonFile: string): Promise<any> {
    let data = await promises.fs.readFile(jsonFile);
    let parsedJson = null;
    try {
        parsedJson = JSON.parse(data.toString());
    } catch (ex) {
        console.log(jsonFile);
        throw ex;

    }
    return parsedJson;
}

function _checkModel(schema: any, model: any) {
    schema.properties = schema.properties || {};
    schema.properties.id = idDefinition();
    schema.meta = schema.meta || {};
}


function _checkRelations(schema: any, model: any) {
    // schema.meta.parent = null;
    let isView = schema.view;
    schema.relations && Object.keys(schema.relations).forEach(relName => {
        let rel = schema.relations[relName];
        rel.nameSpace = rel.nameSpace || schema.nameSpace;
        if (!rel.type)
            throw util.format('Invalid relation "%s.%s", type is missing.', schema.name, relName);
        rel.title = rel.title || relName;
        if (rel.type === RELATION_TYPE.belongsTo) {
            if (isView)
                throw util.format('Invalid relation "%s.%s": a view can\'t belongs to other entity or view.', schema.name, relName);
            rel.aggregationKind = rel.aggregationKind || AGGREGATION_KIND.composite;
            if (rel.aggregationKind === AGGREGATION_KIND.none) {
                throw util.format('Invalid relation "%s.%s", aggregationKind must be composite or shared.', schema.name, relName);
            }
            if (rel.aggregationKind === AGGREGATION_KIND.composite) {
                schema.meta.parent = rel.model;
            }
        } else {
            rel.aggregationKind = rel.aggregationKind || AGGREGATION_KIND.none;
        }

        if (!rel.model || !model[rel.model])
            throw util.format('Invalid relation "%s.%s", invalid remote entity.', schema.name, relName);
        let refModel = model[rel.model];
        let refRel = null;
        if (rel.invRel) {
            if (isView)
                throw util.format('Invalid relation "%s.%s": invRel is not allowed.', schema.name, relName);
            if (refModel.view)
                throw util.format('Invalid relation "%s.%s": "%s" is a view.', schema.name, relName, rel.model);
            refModel.relations = refModel.relations || {};
            refRel = refModel.relations[rel.invRel];
        }
        if (isView) {
            if (rel.aggregationKind === AGGREGATION_KIND.shared) {
                throw util.format('Invalid relation "%s.%s", a view can\'t have aggregations.', schema.name, relName);
            }
            let lf = relName + 'Id';
            if (rel.type === RELATION_TYPE.hasOne) {
                rel.localFields = [lf];
                rel.foreignFields = ['id'];
                schema.properties[lf] = refIdDefinition();
            } else if (rel.type === RELATION_TYPE.hasMany) {
                rel.localFields = [lf];
                rel.foreignFields = ['id'];
                schema.properties[lf] = {
                    type: JSONTYPES.array,
                    items: refIdDefinition()
                }

            } else
                throw util.format('Invalid relation "%s.%s", invalid relation type.', schema.name, relName);

        } else {
            let isCompositionParent = (rel.aggregationKind === AGGREGATION_KIND.composite) && (rel.type !== RELATION_TYPE.belongsTo);
            if (!refRel && (rel.aggregationKind !== AGGREGATION_KIND.none)) {
                if (!isCompositionParent)
                    throw util.format('Invalid relation "%s.%s", invRel for aggregations and compositions is required.', schema.name, relName);
            }
            if (refRel) {
                if (refRel.type === RELATION_TYPE.belongsTo) {
                    refRel.aggregationKind = refRel.aggregationKind || AGGREGATION_KIND.composite;
                    if (rel.aggregationKind === AGGREGATION_KIND.none) {
                        throw util.format('Invalid relation "%s.%s", aggregationKind must be composite or shared.', schema.name, relName);
                    }
                } else
                    refRel.aggregationKind = refRel.aggregationKind || AGGREGATION_KIND.none;

                if (refRel.aggregationKind !== rel.aggregationKind) {
                    throw util.format('Invalid type  %s.%s.aggregationKind !== %s.%s.aggregationKind.', schema.name, relName, refModel.name, rel.invRel);
                }
                if (refRel.type === rel.type) {
                    throw util.format('Invalid type  %s.%s.type === %s.%s.type.', schema.name, relName, refModel.name, rel.invRel);
                }
                rel.invType = refRel.type;
            }

            if (!rel.localFields || !rel.foreignFields) {
                if (rel.type === RELATION_TYPE.hasOne) {
                    if (rel.aggregationKind === AGGREGATION_KIND.none) {
                        rel.localFields = [relName + 'Id'];
                        rel.foreignFields = ['id'];
                    } else {
                        // ref rel is belongsTo
                        if (refRel) {
                            rel.localFields = ['id'];
                            rel.foreignFields = [rel.invRel + 'Id'];
                        }
                    }
                } else if (rel.type === RELATION_TYPE.belongsTo) {
                    rel.localFields = [relName + 'Id'];
                    rel.foreignFields = ['id'];
                } else if (rel.type === RELATION_TYPE.hasMany) {
                    if (refRel) {
                        rel.localFields = ['id'];
                        rel.foreignFields = [rel.invRel + 'Id'];
                    }
                }
            }
            if (rel.foreignFields.length !== rel.localFields.length)
                throw util.format('Invalid relation "%s.%s", #foreignFields != #localFields.', schema.name, relName);
            // check fields
            rel.localFields.forEach((lf: string, index: number) => {
                let rf = rel.foreignFields[index];
                let crf = lf === 'id', clf = rf === 'id';
                if (crf && !refModel.properties[rf]) {
                    refModel.properties[rf] = refIdDefinition();
                } else if (clf && !schema.properties[lf]) {
                    schema.properties[lf] = refIdDefinition();
                }
                if (!schema.properties[lf])
                    throw util.format('Invalid relation "%s.%s", "%s.%s" - field not found.', schema.name, relName, schema.name, lf);

                if (!refModel.properties[rf])
                    throw util.format('Invalid relation "%s.%s", "%s.%s" - field not found.', schema.name, relName, refModel.name, rf);
                if (refModel.properties[rf].type !== schema.properties[lf].type)
                    throw util.format('Invalid relation "%s.%s", typeof %s != typeof %s.', schema.name, relName);
            });
        }

    });
}


export async function loadModel(pathToModel: string, model: any): Promise<void> {
    let files = await promises.fs.readdir(pathToModel);
    let stats: fs.Stats[];
    let folders = [];
    stats = await Promise.all(files.map((fileName) => {
        let fn = path.join(pathToModel, fileName);
        return promises.fs.lstat(fn);
    }));
    let jsonFiles: string[] = [];
    stats.forEach((stat, index) => {
        let fn = path.join(pathToModel, files[index]);
        if (stat.isDirectory()) return;
        if (path.extname(fn) === '.json') {
            jsonFiles.push(fn);
        }
    });
    let modelByJsonFile: any = {};
    let schemas = await Promise.all(jsonFiles.map((fileName) => {
        return loadJsonFromFile(fileName);
    }));

    jsonFiles.forEach((fileName, index) => {
        let p = path.parse(fileName);
        let schema = schemas[index];
        schema.name = schema.name || p.name;
        modelByJsonFile[p.name + '.' + p.ext] = schema;
    });
    schemas.forEach((schema) => {
        _expand$Ref(schema, [], modelByJsonFile, schema.definitions);
        model[schema.name] = schema;
    });
    schemas.forEach(schema => {
        _checkModel(schema, model);
    });
    schemas.forEach(schema => {
        _checkRelations(schema, model);
    });

}
