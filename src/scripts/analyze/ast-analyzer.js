
/**
 * Analyseur AST pour la détection des problèmes de contexte React
 * Remplace les expressions régulières par un analyseur AST plus précis et performant
 */

const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const t = require('@babel/types');

/**
 * Analyse le contenu d'un fichier avec l'AST pour détecter les problèmes
 * @param {string} filePath - Chemin du fichier à analyser
 * @param {string} content - Contenu du fichier
 * @returns {Object} Résultats de l'analyse (problèmes détectés)
 */
function analyzeWithAST(filePath, content) {
  const problems = [];
  let ast;

  try {
    // Configurer l'analyseur pour supporter TypeScript et JSX
    ast = parser.parse(content, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript', 'decorators-legacy', 'classProperties'],
      errorRecovery: true, // Continue l'analyse même en cas d'erreur de syntaxe
    });
  } catch (err) {
    return {
      problems: [{
        type: 'parse-error',
        message: `Erreur d'analyse syntaxique: ${err.message}`,
        location: err.loc || { line: 0, column: 0 }
      }],
      imports: []
    };
  }

  const imports = [];

  // Analyser l'AST
  traverse(ast, {
    // Détecter les imports directs de React
    ImportDeclaration(path) {
      const source = path.node.source.value;

      // Collecter tous les imports pour l'analyse des dépendances
      imports.push({
        source,
        specifiers: path.node.specifiers.map(spec => {
          if (t.isImportDefaultSpecifier(spec)) {
            return { type: 'default', name: spec.local.name };
          } else if (t.isImportSpecifier(spec)) {
            return { 
              type: 'named', 
              name: spec.local.name,
              imported: spec.imported ? spec.imported.name : spec.local.name 
            };
          } else {
            return { type: 'namespace', name: spec.local.name };
          }
        })
      });

      // Vérifier les imports problématiques
      if (source === 'react') {
        // Vérifier si createContext est importé directement
        const hasCreateContext = path.node.specifiers.some(spec => 
          t.isImportSpecifier(spec) && 
          spec.imported && 
          spec.imported.name === 'createContext'
        );

        if (hasCreateContext) {
          problems.push({
            type: 'direct-context-import',
            message: `Import direct de createContext depuis 'react'`,
            suggestion: `Utilisez import { createContext } from '@/core/ReactInstance';`,
            location: path.node.loc
          });
        }

        // Vérifier l'import par défaut de React
        const hasDefaultReact = path.node.specifiers.some(spec => 
          t.isImportDefaultSpecifier(spec)
        );

        if (hasDefaultReact && source === 'react' && !filePath.includes('ReactInstance')) {
          problems.push({
            type: 'direct-react-import',
            message: `Import direct de React depuis 'react'`,
            suggestion: `Utilisez import { React } from '@/core/ReactInstance';`,
            location: path.node.loc
          });
        }
      }
    },

    // Détecter les utilisations de React.createContext
    MemberExpression(path) {
      if (
        t.isIdentifier(path.node.object, { name: 'React' }) &&
        t.isIdentifier(path.node.property, { name: 'createContext' }) &&
        t.isCallExpression(path.parent)
      ) {
        // Vérifier si nous sommes dans le fichier ReactInstance lui-même
        if (!filePath.includes('ReactInstance')) {
          problems.push({
            type: 'react-createcontext',
            message: 'Utilisation directe de React.createContext',
            suggestion: `Utilisez createContextSafely depuis '@/core/ReactInstance'`,
            location: path.node.loc
          });
        }
      }
    },
    
    // Détecter les utilisations incorrectes de fonctions avec des génériques
    TSTypeParameterInstantiation(path) {
      // Vérifier si le parent est un appel de fonction
      if (t.isCallExpression(path.parent)) {
        const callee = path.parent.callee;
        
        // Vérifier si c'est une expression membre (ex: React.useState)
        if (t.isMemberExpression(callee)) {
          const object = callee.object;
          const property = callee.property;
          
          if (t.isIdentifier(object, { name: 'React' }) && 
              t.isIdentifier(property) && 
              ['useState', 'createContext'].includes(property.name)) {
            
            problems.push({
              type: 'generic-usage',
              message: `Utilisation incorrecte de génériques avec ${property.name}`,
              suggestion: `Utilisez ${property.name} sans arguments de type explicites, laissez TypeScript les inférer`,
              location: path.node.loc
            });
          }
        }
      }
    }
  });

  return { problems, imports };
}

module.exports = {
  analyzeWithAST
};
