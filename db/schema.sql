--
-- PostgreSQL database dump
--

\restrict 0dSrnJWg25jTrvVKWhjOPqMx6PezSNpMx0SLLSBqf7j0oeeLvZiC3YI0AGEfynQ

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: next_batch_id(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.next_batch_id() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF NEW.batch_id IS NULL THEN
    SELECT COALESCE(MAX(batch_id), 0) + 1
    INTO NEW.batch_id
    FROM pocket_items
    WHERE instance_hash = NEW.instance_hash;
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION public.next_batch_id() OWNER TO postgres;

--
-- Name: next_file_id(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.next_file_id() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF NEW.file_id IS NULL THEN
    SELECT COALESCE(MAX(file_id), 0) + 1
    INTO NEW.file_id
    FROM pocket_items
    WHERE instance_hash = NEW.instance_hash
      AND batch_id = NEW.batch_id;
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION public.next_file_id() OWNER TO postgres;

--
-- Name: set_generated_filename(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.set_generated_filename() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  ext text;
BEGIN
  -- extract file extension if original filename exists
  IF NEW.original_filename IS NOT NULL THEN
    ext := '.' || split_part(NEW.original_filename, '.', -1);
  ELSE
    ext := '';
  END IF;

  NEW.generated_filename :=
    'batch_' || NEW.batch_id || '_file_' || NEW.file_id || ext;

  RETURN NEW;
END;
$$;


ALTER FUNCTION public.set_generated_filename() OWNER TO postgres;

--
-- Name: set_ids_and_filename(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.set_ids_and_filename() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  ext text := '';
BEGIN
  -- batch_id logic
  IF NEW.batch_id IS NULL THEN
    SELECT COALESCE(MAX(batch_id), 0) + 1
    INTO NEW.batch_id
    FROM pocket_items
    WHERE instance_hash = NEW.instance_hash;
  END IF;

  -- file_id logic
  IF NEW.file_id IS NULL THEN
    SELECT COALESCE(MAX(file_id), 0) + 1
    INTO NEW.file_id
    FROM pocket_items
    WHERE instance_hash = NEW.instance_hash
      AND batch_id = NEW.batch_id;
  END IF;

  -- filename
  IF NEW.original_file_name IS NOT NULL THEN
    ext := '.' || split_part(NEW.original_file_name, '.', -1);
  END IF;

  NEW.file_name :=
    'batch_' || NEW.batch_id || '_file_' || NEW.file_id || ext;

  RETURN NEW;
END;
$$;


ALTER FUNCTION public.set_ids_and_filename() OWNER TO postgres;

--
-- Name: set_qr_expiry(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.set_qr_expiry() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.expires_at := now() + interval '15 minutes';
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.set_qr_expiry() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: pocket_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pocket_items (
    id integer NOT NULL,
    instance_hash uuid NOT NULL,
    file_name text NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    burn boolean DEFAULT false NOT NULL,
    batch_id integer NOT NULL,
    file_id integer NOT NULL,
    original_file_name text,
    ciphertext bytea,
    iv bytea,
    text text
);


ALTER TABLE public.pocket_items OWNER TO postgres;

--
-- Name: pocket_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pocket_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pocket_items_id_seq OWNER TO postgres;

--
-- Name: pocket_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pocket_items_id_seq OWNED BY public.pocket_items.id;


--
-- Name: pocket_qr_codes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pocket_qr_codes (
    id integer NOT NULL,
    instance_hash uuid NOT NULL,
    qr_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone NOT NULL
);


ALTER TABLE public.pocket_qr_codes OWNER TO postgres;

--
-- Name: pocket_qr_codes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pocket_qr_codes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pocket_qr_codes_id_seq OWNER TO postgres;

--
-- Name: pocket_qr_codes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pocket_qr_codes_id_seq OWNED BY public.pocket_qr_codes.id;


--
-- Name: pockets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pockets (
    id integer NOT NULL,
    pocket_id character varying(6) NOT NULL,
    instance_hash uuid DEFAULT gen_random_uuid() NOT NULL,
    passcode_hash text DEFAULT ''::text NOT NULL,
    expires_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    status character varying(10) DEFAULT 'reserved'::character varying NOT NULL,
    salt bytea
);


ALTER TABLE public.pockets OWNER TO postgres;

--
-- Name: pockets_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pockets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pockets_id_seq OWNER TO postgres;

--
-- Name: pockets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pockets_id_seq OWNED BY public.pockets.id;


--
-- Name: pocket_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pocket_items ALTER COLUMN id SET DEFAULT nextval('public.pocket_items_id_seq'::regclass);


--
-- Name: pocket_qr_codes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pocket_qr_codes ALTER COLUMN id SET DEFAULT nextval('public.pocket_qr_codes_id_seq'::regclass);


--
-- Name: pockets id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pockets ALTER COLUMN id SET DEFAULT nextval('public.pockets_id_seq'::regclass);


--
-- Name: pocket_items pocket_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pocket_items
    ADD CONSTRAINT pocket_items_pkey PRIMARY KEY (id);


--
-- Name: pocket_qr_codes pocket_qr_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pocket_qr_codes
    ADD CONSTRAINT pocket_qr_codes_pkey PRIMARY KEY (id);


--
-- Name: pocket_qr_codes pocket_qr_codes_qr_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pocket_qr_codes
    ADD CONSTRAINT pocket_qr_codes_qr_id_key UNIQUE (qr_id);


--
-- Name: pockets pockets_instance_hash_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pockets
    ADD CONSTRAINT pockets_instance_hash_key UNIQUE (instance_hash);


--
-- Name: pockets pockets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pockets
    ADD CONSTRAINT pockets_pkey PRIMARY KEY (id);


--
-- Name: pockets pockets_pocket_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pockets
    ADD CONSTRAINT pockets_pocket_id_key UNIQUE (pocket_id);


--
-- Name: pocket_qr_codes qr_expiry_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER qr_expiry_trigger BEFORE INSERT ON public.pocket_qr_codes FOR EACH ROW EXECUTE FUNCTION public.set_qr_expiry();


--
-- Name: pocket_items trg_set_ids_and_filename; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_set_ids_and_filename BEFORE INSERT ON public.pocket_items FOR EACH ROW EXECUTE FUNCTION public.set_ids_and_filename();


--
-- Name: pocket_items pocket_items_instance_hash_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pocket_items
    ADD CONSTRAINT pocket_items_instance_hash_fkey FOREIGN KEY (instance_hash) REFERENCES public.pockets(instance_hash) ON DELETE CASCADE;


--
-- Name: pocket_qr_codes pocket_qr_codes_instance_hash_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pocket_qr_codes
    ADD CONSTRAINT pocket_qr_codes_instance_hash_fkey FOREIGN KEY (instance_hash) REFERENCES public.pockets(instance_hash) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 0dSrnJWg25jTrvVKWhjOPqMx6PezSNpMx0SLLSBqf7j0oeeLvZiC3YI0AGEfynQ

