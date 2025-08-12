from pydantic import BaseModel
from fastapi import APIRouter, HTTPException, status
from Utils.categorias_utils import ler_categorias, salvar_categorias
from .adm_client import carregar_db, salvar_db

router = APIRouter()

class Categorias(BaseModel):
    categoria: str

# ENDPOINT 1 - GET listar categorias
@router.get("/", status_code=status.HTTP_200_OK, tags=["categorias"])
def listar_categorias():
    """
        Endpoint para obter a lista de categorias disponíveis.

        método: GET
        caminho: localhost:8000/categorias
        payload:
        ```json
        {}
        ```
        resposta:
        ```json
        ["BEBIDAS", "LANCHES", ...]
        ```
    """
    return ler_categorias()

# ENDPOINT 2 - POST criar categoria
@router.post("/", status_code=status.HTTP_201_CREATED, tags=["categorias"])
def criar_categoria(nome: Categorias):
    """
        Endpoint para criar uma nova categoria.

        método: POST
        caminho: localhost:8000/categorias
        payload:
        ```json
        {
            "categoria": "NOME_DA_CATEGORIA"
        }
        ```
        resposta (sucesso):
        ```json
        {
            "mensagem": "Categoria criada",
            "nome": "NOME_DA_CATEGORIA"
        }
        ```
    """
    nome = nome.categoria
    
    if not nome or not nome.strip():
        raise HTTPException(status_code=400, detail="O nome da categoria é obrigatório")
    
    categorias = ler_categorias()
    
    if nome in categorias:
        raise HTTPException(status_code=400, detail="Categoria já existe")
    
    categorias.append(nome)
    
    salvar_categorias(categorias)
    
    return {"mensagem": "Categoria criada", "nome": nome}

# ENDPOINT 3 - PUT atualizar categoria
@router.put("/{nome_antigo}", status_code=status.HTTP_200_OK, tags=["categorias"])
def atualizar_categoria(nome_antigo: str, nome_novo: Categorias):
    """
        Endpoint para atualizar o nome de uma categoria existente.
        A lista dos itens associados também será atualizada.

        método: PUT
        caminho: localhost:8000/categorias/{nome_antigo}
        payload:
        ```json
        {
            "categoria": "NOVO_NOME"
        }
        ```
        resposta (sucesso):
        ```json
        {
            "mensagem": "Categoria atualizada",
            "nome": "NOVO_NOME"
        }
        ```
    """
    nome_novo_str = nome_novo.categoria
    categorias = ler_categorias()
    
    if nome_antigo not in categorias:
        raise HTTPException(status_code=404, detail="Categoria não encontrada")
    
    if nome_novo_str in categorias and nome_novo_str != nome_antigo:
        raise HTTPException(status_code=400, detail=f"A categoria '{nome_novo_str}' já existe")

    # Carrega todo o banco de dados para atualização dos itens
    db_data = carregar_db()
    itens = db_data.get("produtos", [])
    itens_foram_atualizados = False
     
    for item in itens:
        if item.get("CATEGORIA") == nome_antigo:
            item["CATEGORIA"] = nome_novo_str
            itens_foram_atualizados = True
    
    # Se algum item foi modificado, salva o banco de dados inteiro de volta
    if itens_foram_atualizados:
        db_data["produtos"] = itens
        salvar_db(db_data) # Usa a função do seu colega para salvar

    # Atualiza o nome na lista de categorias
    categorias[categorias.index(nome_antigo)] = nome_novo_str
    salvar_categorias(categorias)

    return {"mensagem": "Categoria e itens associados atualizados", "nome": nome_novo_str}

# ENDPOINT 4 - DELETE deletar categoria
@router.delete("/{nome}", status_code=status.HTTP_200_OK, tags=["categorias"])
def deletar_categoria(nome: str):
    """
        Endpoint para remover uma categoria existente.
        Remoção só ocorre se não houver itens associados a esta categoria.

        método: DELETE
        caminho: localhost:8000/categorias/{nome}
        payload:
        ```json
        {}
        ```
        resposta (sucesso):
        ```json
        {
            "mensagem": "Categoria removida"
        }
        ```
    """
    categorias = ler_categorias()
    
    if nome not in categorias:
        raise HTTPException(status_code=404, detail="Categoria não encontrada")
    
    # Verifica se algum item está usando a categoria que se deseja excluir
    db_data = carregar_db()
    itens = db_data.get("produtos", [])
    itens_associados = [item for item in itens if item.get("CATEGORIA") == nome]

    # Se houver itens associados, bloqueia a exclusão e retorna um erro
    if itens_associados:
        raise HTTPException(
            status_code=409,
            detail=f"Não é possível remover. Existem {len(itens_associados)} itens associados à categoria '{nome}'."
        )

    categorias.remove(nome)
    salvar_categorias(categorias)

    return {"mensagem": "Categoria removida com sucesso"}